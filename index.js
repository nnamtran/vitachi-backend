require('dotenv').config()
const path = require('path')
 
PORT = process.env.PORT || 3004;

const express = require("express")
const path = require("path")
const multer = require("multer")
const cors = require("cors");

const {MongoClient} = require('mongodb')
const uri = "mongodb+srv://vitachimart:vitachimartecommerce@cluster0.eep3pnp.mongodb.net/?retryWrites=true&w=majority";


const app = express()
app.use(express.json())
app.use(cors());

const fs = require("fs");


var storage = multer.memoryStorage();
        
var upload = multer({ 
    storage: storage,
});       
  
app.get("/",function(req,res){
    res.render("Signup");
})
    
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

        const insertedProduct = await register.insertOne(data);
        res.status(200).send("Success");

    } catch(error) {
        console.log(error)
    }
})

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