const express = require("express");
const router = express.Router();
const userproductController = require("../controllers/userproductController");

// List all products
router.get("/getallproducts", userproductController.getAllProducts);

// List products by category
router.get("/category/:category", userproductController.getProductsByCategory);

// View single product details by product ID
router.get("/:productId", userproductController.getProductById);

// Sort products by quantity
router.get("/sort/quantity", userproductController.sortProductsByQuantity);

// Filter products by a specific criteria
router.get("/filter/:criteria/:value", userproductController.filterProducts);

module.exports = router;
