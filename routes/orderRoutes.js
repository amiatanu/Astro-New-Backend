const express = require("express");
const router = express.Router();

const {
	createOrder,
	getAllOrders,
	getDeliveredOrders,
	getOrderById, // Add this controller
	getUserOrders, // You can use this for getting all orders for a user
	editOrder,
} = require("../controllers/orderController");

//Middleware to authenticate user
const { authenticateUser } = require("../middleware/userMiddleware");

//Middleware to authenticate admin
const { authenticateAdmin } = require("../middleware/adminMiddleware");

/*                       Admin                       */
// Route to create an order
router.post("/createOrderAdmin", authenticateAdmin, createOrder);

// Route to get all orders
router.get("/getallorders", authenticateAdmin, getAllOrders);

// Route to get order details with delivered items
router.get("/deliveredorders", authenticateAdmin, getDeliveredOrders);

//Route to edit order
router.put("/editorder/:orderId", authenticateAdmin, editOrder);

// Route to get an order by ID
router.get("/getOrderByIdForAdmin/:orderId", authenticateUser, getOrderById);

/*                        User                            */
// Route to create an order
router.post("/createorder", authenticateUser, createOrder);

// Route to get an order by ID
router.get("/getorderbyid/:orderId", authenticateUser, getOrderById);

// Route to get all orders for a user
router.get("/getuserorders/:userId", authenticateUser, getUserOrders);

module.exports = router;
