const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/adminMiddleware");

// Create a new category
router.post(
  "/categories",
  auth.authenticateAdmin,
  categoryController.createCategory
);

// Get all categories
router.get("/getallcategories", categoryController.getAllCategories);

module.exports = router;
