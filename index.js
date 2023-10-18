require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Import body-parser middleware
const userRoutes = require("./routes/userRoutes"); // Import userRoutes
const astrologerRoutes = require("./routes/astrologerRoutes"); // Import astrologerRoutes
const adminRoutes = require("./routes/adminRoutes");
const blogRoutes = require("./routes/blogRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userproductRoutes = require("./routes/userproductRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { initSocket } = require("./middleware/socket");
const chatRoutes = require("./routes/chatRoutes");
const path = require("path");

// Create an Express app
const app = express();
const server = http.createServer(app);

// Define the port
const PORT = process.env.PORT || 8080;

// Connect to MongoDB using the URI from .env
mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Connected to MongoDB");

		// Middleware to parse JSON request bodies
		app.use(bodyParser.json());

		// Mount user routes with authentication middleware
		app.use("/api/user", userRoutes);
		app.use("/api/astrologer", astrologerRoutes);
		app.use("/api/admin", adminRoutes);
		app.use("/api/blogs", blogRoutes);
		app.use("/api/category", categoryRoutes);
		app.use("/api/product", productRoutes);
		app.use("/api/userproducts", userproductRoutes);
		app.use("/api/cart", cartRoutes);
		app.use("/api/Wishlist", wishlistRoutes);
		app.use("/api/addresses", addressRoutes);
		app.use("/api/orders", orderRoutes);
		app.use("/api/chat", chatRoutes);

		initSocket(server);

		// Start the server after successful database connection
		server.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});
