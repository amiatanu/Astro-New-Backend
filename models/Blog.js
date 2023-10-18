const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
	title: String,
	content: String,
	images: [String], // Store image filenames as an array of strings
	isDraft: Boolean,
	authorName: String,
	dateofCreation: String,
	timeofCreation: String,
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", blogSchema);
