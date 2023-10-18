const Testimonial = require("../models/Testimonial");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const path = require("path");

const storage = new Storage({
	keyFilename: process.env.GCS_KEYFILE_PATH,
	projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME;

// Function to upload an image to Google Cloud Storage
const uploadImageToGoogleCloudStorage = async (buffer, mimetype) => {
	const ext = mimetype.split("/").pop();
	const filename = `testimonialUploads/${Date.now()}-${Math.floor(
		Math.random() * 1000
	)}.${ext}`;
	const gcsFile = storage.bucket(bucketName).file(filename);

	try {
		await gcsFile.save(buffer, {
			metadata: {
				contentType: mimetype,
			},
		});
		return gcsFile.publicUrl();
	} catch (error) {
		throw new Error("Error uploading image to Google Cloud Storage");
	}
};

// Controller method to create a testimonial with user profile picture upload
const createTestimonial = async (req, res) => {
	try {
		const { rating, userName, review } = req.body;

		// Check if a file was uploaded
		if (!req.file) {
			return res.status(400).json({ message: "Profile picture is required" });
		}

		// Upload user profile picture to Google Cloud Storage
		const userProfilePicture = await uploadImageToGoogleCloudStorage(
			req.file.buffer,
			req.file.mimetype
		);

		const testimonial = new Testimonial({
			rating,
			userName,
			review,
			userProfilePicture, // Store the image URL
		});

		const savedTestimonial = await testimonial.save();

		res.status(201).json({
			success: "01",
			message: "Testimonial Created Successfully",
			savedTestimonial,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Internal server error", error: error.message });
	}
};

async function getTestimonials(req, res) {
	try {
		const testimonials = await Testimonial.find();
		res.status(200).json(testimonials);
	} catch (err) {
		res.status(500).json({ error: "Error fetching testimonials" });
	}
}

async function getTestimonialById(req, res) {
	try {
		const testimonial = await Testimonial.findById(req.params.id);
		if (!testimonial) {
			return res.status(404).json({ error: "Testimonial not found" });
		}
		res.status(200).json(testimonial);
	} catch (err) {
		res.status(500).json({ error: "Error fetching testimonial" });
	}
}

async function updateTestimonial(req, res) {
	try {
		const testimonial = await Testimonial.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!testimonial) {
			return res.status(404).json({ error: "Testimonial not found" });
		}
		res.status(200).json(testimonial);
	} catch (err) {
		res.status(500).json({ error: "Error updating testimonial" });
	}
}

async function deleteTestimonial(req, res) {
	try {
		const testimonial = await Testimonial.findByIdAndRemove(req.params.id);
		if (!testimonial) {
			return res.status(404).json({ error: "Testimonial not found" });
		}
		res.status(204).end();
	} catch (err) {
		res.status(500).json({ error: "Error deleting testimonial" });
	}
}

module.exports = {
	createTestimonial,
	getTestimonials,
	getTestimonialById,
	updateTestimonial,
	deleteTestimonial,
};
