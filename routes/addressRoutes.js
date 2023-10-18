const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authenticateUser } = require("../middleware/userMiddleware");

// Add a new address
router.post("/addaddress", authenticateUser, addressController.addAddress);

// Add shipping address by user id
router.post("/addShippingAddress", addressController.addShippingAddress);


router.get('/addresses/:shippingId', addressController.getAddressesByShippingId),


module.exports = router;
