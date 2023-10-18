const Cart = require("../models/Cart");
const Product = require("../models/ProductModel");

// Add a product to the cart
async function addToCart(req, res) {
	try {
		const { userId, productId, quantity } = req.body;

		// Check if a cart exists for the user
		let cart = await Cart.findOne({ userId });

		if (!cart) {
			// If no cart exists, create a new cart for the user
			cart = new Cart({ userId, items: [] });
		}

		// Check if the product already exists in the cart
		const existingItem = cart.items.find(
			(item) => item.productId === productId
		);

		if (existingItem) {
			// If the product exists in the cart, update its quantity
			existingItem.quantity += quantity;
		} else {
			// If the product doesn't exist in the cart, add it as a new item
			cart.items.push({ productId, quantity });
		}

		// Save the updated cart
		await cart.save();

		return res.status(200).json({
			message: "Product added to cart successfully",
			cartId: cart._id,
		});
	} catch (error) {
		console.error("Error adding product to cart:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

// Controller to delete an item from the cart by productId
async function removeFromCart(req, res) {
	try {
		const { cartId, productId } = req.params;

		// Find the cart by cartId
		const cart = await Cart.findById(cartId);

		if (!cart) {
			return res.status(404).json({ error: "Cart not found" });
		}

		// Find the index of the item with the given productId in the cart items array
		const itemIndex = cart.items.findIndex(
			(item) => item.productId === productId
		);

		if (itemIndex === -1) {
			return res.status(404).json({ error: "Item not found in the cart" });
		}

		// Remove the item from the cart's items array
		cart.items.splice(itemIndex, 1);

		// Save the updated cart
		await cart.save();

		res.status(200).json({ message: "Item removed from the cart" });
	} catch (error) {
		res.status(500).json({
			error: "Error removing item from the cart",
			details: error.message,
		});
	}
}

// Calculate price details, total price, total discount, and order total
async function calculateCartTotal(req, res) {
	const userId = req.user;

	try {
		const cart = await Cart.findOne({ user: userId });

		if (!cart) {
			return res.status(404).json({ error: "Cart not found" });
		}

		// Calculate total price and total discount
		let totalPrice = 0;
		let totalDiscount = 0;

		for (const item of cart.items) {
			const product = await Product.findById(item.product);

			if (product) {
				totalPrice += product.price * item.quantity;
				totalDiscount += (product.price - product.discount) * item.quantity;
			}
		}

		// Calculate order total
		const orderTotal = totalPrice - totalDiscount;

		res.json({ totalPrice, totalDiscount, orderTotal });
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}

// Function to get the cart for a user
async function getCart(req, res) {
	const userId = req.user;

	try {
		const cart = await Cart.findOne({ user: userId });

		if (!cart) {
			return res.status(404).json({ error: "Cart not found" });
		}

		res.json(cart);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}

module.exports = {
	addToCart,
	removeFromCart,
	calculateCartTotal,
	getCart,
};
