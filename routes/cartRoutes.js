const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateUser } = require("../middleware/userMiddleware");

// Add a product to the carts
router.post("/addCarts", authenticateUser, cartController.addToCart);

// Delete a product from the cart
router.delete(
	"/:cartId/remove/:productId",
	authenticateUser,
	cartController.removeFromCart
);
//calculate total price
router.get(
	"/calculate-total",
	authenticateUser,
	cartController.calculateCartTotal
);

// Get the cart for a user
router.get("/", authenticateUser, cartController.getCart);

module.exports = router;
