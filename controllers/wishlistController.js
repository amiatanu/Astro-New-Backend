const Wishlist = require("../models/Wishlist");

// Controller to add a product to a user's wishlist
async function addToWishlist(req, res) {
	try {
		const { _id: userId } = req.params;
		const { productId } = req.body;

		const wishlist = await Wishlist.findOneAndUpdate(
			{ userId },
			{ $push: { products: { productId } } },
			{ upsert: true, new: true }
		);

		res.status(201).json(wishlist);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error adding to wishlist", details: error.message });
	}
}

// Controller to delete an item from a user's wishlist by product ID
async function removeFromWishlist(req, res) {
	try {
		const { _id: userId, productId } = req.params;

		const wishlist = await Wishlist.findOneAndUpdate(
			{ userId },
			{ $pull: { products: { productId } } },
			{ new: true }
		);

		res.json(wishlist);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error removing from wishlist", details: error.message });
	}
}

// Controller to get a user's wishlist
async function getWishlist(req, res) {
	try {
		const { _id: userId } = req.params;

		const wishlist = await Wishlist.findOne({ userId }).populate(
			"products.productId"
		);

		res.json(wishlist);
	} catch (error) {
		res.status(500).json({ error: "Error getting wishlist" });
	}
}

module.exports = {
	addToWishlist,
	removeFromWishlist,
	getWishlist,
};
