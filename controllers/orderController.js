const Order = require("../models/Order");

// Calculate the order total based on the products array
function calculateOrderTotal(products) {
	return products.reduce((total, product) => {
		return total + product.totalPrice; // Use totalPrice instead of quantity * price
	}, 0);
}

// Controller to create an order
async function createOrder(req, res) {
	try {
		const { products, shippingAddress, user } = req.body;

		// Calculate the total price for each product and populate the totalPrice field
		products.forEach((product) => {
			product.totalPrice = product.quantity * product.productID.price;
		});

		const orderTotal = calculateOrderTotal(products);

		const order = new Order({
			products,
			shippingAddress,
			user,
			orderTotal, // Adding the calculated order total
		});

		await order.save();

		res.status(201).json(order);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error creating order", details: error.message });
	}
}

// Controller to get all orders
async function getAllOrders(req, res) {
	try {
		const orders = await Order.find().populate("products.productID user");
		res.json(orders);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error fetching all orders", details: error.message });
	}
}

// Controller to get order details with delivered items
async function getDeliveredOrders(req, res) {
	try {
		const deliveredOrders = await Order.find({ isDelivered: true }).populate(
			"products.productID user"
		);
		res.json(deliveredOrders);
	} catch (error) {
		res.status(500).json({
			error: "Error fetching delivered orders",
			details: error.message,
		});
	}
}

// Controller to get an order by ID
async function getOrderById(req, res) {
	try {
		const orderId = req.params.orderId;
		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ error: "Order not found" });
		}

		res.json(order);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error fetching order details", details: error.message });
	}
}

// Controller to get all orders for a user
async function getUserOrders(req, res) {
	try {
		const userId = req.params.userId;
		const orders = await Order.find({ userId });

		res.json(orders);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error fetching user orders", details: error.message });
	}
}

//edit order

async function editOrder(req, res) {
	try {
		const orderId = req.params.orderId;
		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ error: "Order not found" });
		}

		const { products, shippingAddress, user } = req.body;

		// Calculate the total price for each product and populate the totalPrice field
		products.forEach((product) => {
			product.totalPrice = product.quantity * product.productID.price;
		});

		const orderTotal = calculateOrderTotal(products);

		order.products = products;
		order.shippingAddress = shippingAddress;
		order.user = user;
		order.orderTotal = orderTotal;

		await order.save();

		res.status(201).json(order);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error creating order", details: error.message });
	}
}

module.exports = {
	createOrder,
	getAllOrders,
	getDeliveredOrders,
	getOrderById, // Add this controller
	getUserOrders, // You can use this for getting all orders for a user
	editOrder,
};
