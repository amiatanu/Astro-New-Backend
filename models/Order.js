const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		products: [
			{
				productID: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				productTitle: {
					type: String,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				totalPrice: {
					type: Number,
					required: true,
				},
			},
		],
		shippingAddress: {
			type: String, // Storing the shipping address as a string
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isDelivered: {
			type: Boolean,
			default: false,
		},
		orderTotal: {
			type: Number, // Storing the order total as a number
			required: true,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
