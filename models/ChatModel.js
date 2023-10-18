const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
	astrologerId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	consultationId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	messages: [
		{
			senderId: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
			},
			message: {
				type: String,
				required: true,
			},
			timestamp: {
				type: Date,
				default: Date.now,
			},
		},
	],
	isClosed: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model("Chat", chatSchema);
