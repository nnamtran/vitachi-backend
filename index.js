const dotenv = require('dotenv')
const path = require('path')
PORT = process.env.PORT || 3004;

const express = require("express")
const multer = require("multer")
const cors = require("cors");

const fs = require('fs')

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {MongoClient} = require('mongodb')
const uri = "mongodb+srv://vitachimart:vitachimartecommerce@cluster0.eep3pnp.mongodb.net/?retryWrites=true&w=majority";

dotenv.config()



// ----- Start the express app
const app = express()
app.use(express.json())
app.use(cors());

// ----- Configure the S3 Bucket
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

// ----- Using Multer to upload image
var storage = multer.memoryStorage();
        
var upload = multer({ 
    storage: storage,
});       
  
app.get("/",function(req,res){
    res.render("Signup");
})

// ------ Get all the products
app.get('/allproducts', async (req, res, next) => {
    const client = new MongoClient(uri)
    const productCategory = [];

    // let data = fs.readFileSync('./data/all.txt');
    // let response = JSON.parse(data);
    //console.log(response);
    
    try {
        await client.connect()
        const database = client.db('vitachimart-products');
        const products = database.collection('products')

        
        const baby = await products.find({"category": "baby"}).project({
            image: 0
        }).toArray();
        baby.forEach((item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })
        const pregnancy = await products.find({"category": "pregnancy"}).project({
            image: 0
        }).toArray();
        pregnancy.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })
        const vitamins = await products.find({"category": "vitamins"}).project({
            image: 0
        }).toArray();
        vitamins.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })
        const women = await products.find({"category": "women"}).project({
            image: 0
        }).toArray();
        women.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })
        const elderly = await products.find({"category": "elderly"}).project({
            image: 0
        }).toArray();
        elderly.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })   
        const men = await products.find({"category": "men"}).project({
            image: 0
        }).toArray();
        men.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })
        

        productCategory.push({
            vitamins,
            baby,
            elderly,
            men,
            pregnancy,
            women
        })

        
    } finally {
        await client.close()
    }
    res.send(productCategory);
})

// ----- Get array of 6 items for each category - landingpage
app.get('/landingpage', async (req, res, next) => {
    const client = new MongoClient(uri)
    const productCategory = [];
    
    try {
        await client.connect()
        const database = client.db('vitachimart-products');
        const products = database.collection('products')

        // Baby
        const baby = await products.find({"category": "baby"}).project({
            image: 0
        }).limit(6).toArray();
        baby.forEach((item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })

        //Pregnancy
        const pregnancy = await products.find({"category": "pregnancy"}).project({
            image: 0
        }).limit(6).toArray();
        pregnancy.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })

        // Vitamins
        const vitamins = await products.find({"category": "vitamins"}).project({
            image: 0
        }).limit(6).toArray();
        vitamins.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })

        // Women
        const women = await products.find({"category": "women"}).project({
            image: 0
        }).limit(6).toArray();
        women.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })

        // Men
        const men = await products.find({"category": "men"}).project({
            image: 0
        }).limit(6).toArray();
        men.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })

        // Elderly
        const elderly = await products.find({"category": "elderly"}).project({
            image: 0
        }).limit(6).toArray();
        elderly.forEach(async (item) => {
            item.imageUrl = `https://vitachi-products-image.s3.ap-southeast-2.amazonaws.com/${item._id.toString()}`
        })   
        
        // Push every into an object
        productCategory.push({
            vitamins,
            baby,
            elderly,
            men,
            pregnancy,
            women
        })  
    } finally {
        await client.close()
    }
    res.send(productCategory)
})

// ----- Add product for vitachi-additem
app.post("/addproduct", upload.single("image"), async (req, res, next) => {

    const client = new MongoClient(uri)
    const formData = req.body

    try {
        await client.connect()
        const database = client.db('vitachimart-products')
        const register = database.collection('products')
        
        const data = {
            product_name: formData.product_name,
            product_description: formData.product_description,
            price: formData.price,
            rating: formData.rating,
            brand: formData.brand,
            category: formData.category,
            image: {
                data: req.file,
                contentType: "image/png",
            }
        }

        const checkduplicate = await register.findOne({product_name: data.product_name});

        if (checkduplicate) {
            res.status(200).send("Sản phẩm đã có trong dữ liệu");
        } else {
            const insertedProduct = await register.insertOne(data);
            res.status(200).send("success");
        } 

    } catch(error) {
        console.log(error)
    }
})

// ----- Find the product in Vitachi-additem
app.get('/products', async (req, res, next) => {
    const client = new MongoClient(uri)
    const product_name = req.query.getProduct.name;
    //const formData = JSON.parse(req)

    try {
        await client.connect()
        const database = client.db('vitachimart-products');
        const products = database.collection('products')

        const query = {product_name: product_name}
        const product = await products.findOne(query)
        res.send(product)
    } finally {
        await client.close()
    }
})


if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}
    
app.listen(PORT, () => {
    console.log('Server running on PORT ' + PORT);
})