const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  name: String,
  product_description: String,
  price: Number,
  rating: Number,
  img: {
    data: Buffer,
    contentType: String,
  }
});

module.exports = ImageModel = mongoose.model("Image", imgSchema);