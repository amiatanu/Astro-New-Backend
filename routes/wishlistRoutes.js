const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authenticateUser } = require("../middleware/userMiddleware");

// Add a product to a user's wishlist
router.post(
	"/addWishlist/:_id",
	authenticateUser,
	wishlistController.addToWishlist
);

//  Delete an item from a user's wishlist by product ID
router.delete(
	"/removeWishlist/:_id/:productId",
	authenticateUser,
	wishlistController.removeFromWishlist
);

// Get a user's wishlist
router.get(
	"/getWishlist/:_id",
	authenticateUser,
	wishlistController.getWishlist
);

module.exports = router;
