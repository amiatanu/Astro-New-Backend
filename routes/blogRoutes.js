const express = require("express");
const {
	createBlog,
	updateBlog,
	listBlogs,
	viewBlog,
	deleteBlog,
} = require("../controllers/blogController");
const { authenticateAdmin } = require("../middleware/adminMiddleware");

const multer = require("multer");

const router = express.Router();

const multerStorage = multer.memoryStorage(); // Store the file in memory

const upload = multer({
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

// Create a new blog with image uploads
router.post(
	"/createBlog",
	authenticateAdmin,
	upload.array("images", 5),
	createBlog
);

// Update/Edit a selected blog by ID with image uploads
router.put(
	"/editBlog/:id",
	authenticateAdmin,
	upload.array("images", 5),
	updateBlog
);

// List all blogs
router.get("/getBlogsList", authenticateAdmin, listBlogs);

// View a single blog by ID
router.get("/getBlog/:id", authenticateAdmin, viewBlog);

// Delete a blog
router.delete("/deleteBlog/:id", authenticateAdmin, deleteBlog);

module.exports = router;
