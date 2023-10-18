const Category = require("../models/CategoryModel");

// Create a new category
async function createCategory(req, res) {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ category: newCategory, status: "success" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Get all categories
async function getAllCategories(req, res) {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories, status: "success" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
};
