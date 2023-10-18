const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productController");
const auth = require("../middleware/adminMiddleware");

const multerStorage = multer.memoryStorage(); // Store the file in memory

const multerUpload = multer({
	storage: multerStorage,
	limits: {
		fileSize: 5 * 1024 * 1024, // Limit file size to 5MB (adjust as needed)
	},
	fileFilter: (req, file, cb) => {
		// Implement any file validation logic here (e.g., file type checks)
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type. Only images are allowed."));
		}
	},
});

// Create a new product (POST request)
router.post(
	"/createProduct",
	auth.authenticateAdmin,
	multerUpload.fields([
		{ name: "mainImage", maxCount: 1 },
		{ name: "otherImages", maxCount: 4 },
	]),
	productController.createProduct
);

// Edit an existing product (PUT request)
router.put(
	"/edit/:productId",
	auth.authenticateAdmin,
	multerUpload.fields([
		{ name: "mainImage", maxCount: 1 },
		{ name: "otherImages", maxCount: 4 },
	]),
	productController.editProduct
);

// Get all products
router.get("/getAllProducts", productController.getAllProducts);

// Get product by ID
router.get("/getProduct/:id", productController.getProductById);

module.exports = router;
