const Product = require("../models/ProductModel");

// List all products
async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// List products by category
async function getProductsByCategory(req, res) {
  const { category } = req.params;
  console.log(req.params);
  try {
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// View single product details by product ID
async function getProductById(req, res) {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Sort products by quantity 
async function sortProductsByQuantity(req, res) {
  try {
    const products = await Product.find().sort({ quantity: 1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Filter products by a specific criteria 
async function filterProducts(req, res) {
  const { criteria, value } = req.params;
  try {
    let filter = {};
    switch (criteria) {
      case "price":
        filter = { price: { $lt: parseFloat(value) } };
        break;
      default:
        break;
    }
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  sortProductsByQuantity,
  filterProducts,

};
