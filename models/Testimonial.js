const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
	rating: { type: Number, required: true },
	userName: { type: String, required: true },
	userProfilePicture: { type: String }, // Store the image URL here
	review: { type: String, required: true },
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
