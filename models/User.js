const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	mobileNumber: {
		type: String,
		unique: true,
	},
	age: {
		type: Number,
	},
	gender: {
		type: String,
	},
	dateOfBirth: {
		type: String,
	},
	timeOfBirth: {
		type: String,
	},
	placeOfBirth: {
		type: String,
	},
	currentAddress: {
		type: String,
	},
	city: {
		type: String,
	},
	state: {
		type: String,
	},
	country: {
		type: String,
	},
	pincode: {
		type: String,
	},
	profilePictureUrl: String,
	wallet: {
		walletId: Number,
		balance: Number,
	},
});

// Set defaults to null for all fields
userSchema.eachPath((path) => {
	if (!userSchema.path(path).isRequired) {
		userSchema.path(path).default(null);
	}
});

module.exports = mongoose.model("User", userSchema);
