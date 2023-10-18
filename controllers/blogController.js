const Blog = require("../models/Blog");

const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const path = require("path");
const storage = new Storage({
	projectId: process.env.GCS_PROJECT_ID,
	keyFilename: process.env.GCS_KEYFILE_PATH,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Function to create a new blog with image uploads
async function createBlog(req, res) {
	try {
		const { title, content, isDraft, authorName } = req.body;
		const createdAt = new Date(); // Get the current timestamp

		// Create an array to store image URLs
		const imageUrls = [];

		// Check if files are present in the request
		if (req.files && req.files.length > 0) {
			const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

			// Upload each image to GCS and store its URL
			for (const file of req.files) {
				const ext = file.originalname.split(".").pop();
				const filename = `blogUploads/${Date.now()}-${Math.floor(
					Math.random() * 1000
				)}.${ext}`;

				const gcsFile = bucket.file(filename);
				await gcsFile.save(file.buffer, {
					metadata: {
						contentType: file.mimetype,
					},
				});

				imageUrls.push(gcsFile.publicUrl());
			}
		}

		const blog = new Blog({
			title,
			content,
			images: imageUrls,
			isDraft,
			authorName,
			dateofCreation: createdAt.toISOString().split("T")[0],
			timeofCreation: createdAt.toISOString().split("T")[1].slice(0, -1),
		});

		const savedBlog = await blog.save();

		res.status(201).json({
			success: "01",
			message: "Blog Created Successfully",
			savedBlog,
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error });
	}
}

// Function to update a selected blog by ID with image uploads
async function updateBlog(req, res) {
	try {
		const { title, content, isDraft, authorName } = req.body;

		// Check if files are present in the request
		const imageUrls = [];

		if (req.files && req.files.length > 0) {
			const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

			// Upload each image to GCS and store its URL
			for (const file of req.files) {
				const ext = file.originalname.split(".").pop();
				const filename = `blogUploads/${Date.now()}-${Math.floor(
					Math.random() * 1000
				)}.${ext}`;

				const gcsFile = bucket.file(filename);
				await gcsFile.save(file.buffer, {
					metadata: {
						contentType: file.mimetype,
					},
				});

				imageUrls.push(gcsFile.publicUrl());
			}
		} else {
			// No new images provided, so use the existing images (if any)
			const existingBlog = await Blog.findById(req.params.id);
			if (existingBlog) {
				imageUrls.push(...existingBlog.images);
			}
		}

		const updatedFields = {
			title,
			content,
			isDraft,
			authorName,
			images: imageUrls,
		};

		const updatedBlog = await Blog.findByIdAndUpdate(
			req.params.id,
			updatedFields,
			{
				new: true,
			}
		);

		if (!updatedBlog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		res.status(200).json({
			success: "01",
			message: "Blog Updated Successfully",
			updatedBlog,
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error });
	}
}

// List all blogs
async function listBlogs(req, res) {
	try {
		const blogs = await Blog.find();
		res
			.status(200)
			.json({ success: "01", message: "Blogs Retrived Successfully", blogs });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
}

// View a single blog by ID Start
async function viewBlog(req, res) {
	try {
		const blog = await Blog.findById(req.params.id);
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		res.status(200).json({
			success: "01",
			message: "Blog Retrived Successfully",
			blog,
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
}

// Delete a blog
async function deleteBlog(req, res) {
	try {
		const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
		if (!deletedBlog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		res.status(200).json({ message: "Blog deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
}

/*               For User         */
async function viewBlogUser(req, res) {
	try {
		const blog = await Blog.findById(req.params.id).select("-isDraft");
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		res.status(200).json(blog);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
}

async function viewListBlogsUser(req, res) {
	try {
		const nonDraftBlogs = await Blog.find({ isDraft: false }).select(
			"-isDraft"
		);
		res.status(200).json(nonDraftBlogs);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
}

module.exports = {
	createBlog,
	listBlogs,
	viewBlog,
	updateBlog,
	deleteBlog,
	viewBlogUser,
	viewListBlogsUser,
};
