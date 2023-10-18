const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");

const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
	projectId: process.env.GCS_PROJECT_ID,
	keyFilename: process.env.GCS_KEYFILE_PATH,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Function to create a new product
async function createProduct(req, res) {
	try {
		const {
			productTitle,
			category: categoryName,
			productDescription,
			MRP,
			discountPrice,
			stocksAvailable,
		} = req.body;

		const mainImageFile = req.files["mainImage"][0];
		const mainImageFileName = `productUploads/${Date.now()}-${
			mainImageFile.originalname
		}`;
		const mainImageFileBuffer = mainImageFile.buffer;

		const otherImagesFiles = req.files["otherImages"];
		const otherImages = [];

		for (const file of otherImagesFiles) {
			const otherImageFileName = `productUploads/${Date.now()}-${
				file.originalname
			}`;
			const otherImageFileBuffer = file.buffer;

			const fileUpload = bucket.file(otherImageFileName);
			await fileUpload.save(otherImageFileBuffer);

			const otherImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
			otherImages.push(otherImageUrl);
		}

		let category = await Category.findOne({
			name: { $regex: new RegExp(`^${categoryName}$`, "i") },
		});

		if (!category) {
			category = new Category({ name: categoryName });
			await category.save();
		}

		const newProduct = new Product({
			productTitle,
			category: { id: category._id, name: categoryName },
			mainImage: `https://storage.googleapis.com/${bucket.name}/${mainImageFileName}`,
			otherImages,
			productDescription,
			MRP,
			discountPrice,
			stocksAvailable,
		});

		await newProduct.save();

		return res.status(201).json({ message: "Product created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function editProduct(req, res) {
	try {
		const productId = req.params.productId;

		const {
			productTitle,
			category: categoryName,
			productDescription,
			MRP,
			discountPrice,
			stocksAvailable,
		} = req.body;

		let mainImageFileName = "";
		let otherImages = [];

		if (req.files) {
			const mainImageFile = req.files["mainImage"] && req.files["mainImage"][0];
			if (mainImageFile) {
				mainImageFileName = `productUploads/${Date.now()}-${
					mainImageFile.originalname
				}`;
				const mainImageFileBuffer = mainImageFile.buffer;
				const fileUpload = bucket.file(mainImageFileName);
				await fileUpload.save(mainImageFileBuffer);
			}

			const otherImagesFiles = req.files["otherImages"];
			if (otherImagesFiles) {
				otherImages = await Promise.all(
					otherImagesFiles.map(async (file) => {
						const otherImageFileName = `productUploads/${Date.now()}-${
							file.originalname
						}`;
						const otherImageFileBuffer = file.buffer;
						const fileUpload = bucket.file(otherImageFileName);
						await fileUpload.save(otherImageFileBuffer);
						return `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
					})
				);
			}
		}

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		let category = await Category.findOne({
			name: { $regex: new RegExp(`^${categoryName}$`, "i") },
		});

		if (!category) {
			category = new Category({ name: categoryName });
			await category.save();
		}

		product.productTitle = productTitle;
		product.category = { id: category._id, name: categoryName };
		if (mainImageFileName) {
			product.mainImage = `https://storage.googleapis.com/${bucket.name}/${mainImageFileName}`;
		}
		product.otherImages = otherImages;
		product.productDescription = productDescription;
		product.MRP = MRP;
		product.discountPrice = discountPrice;
		product.stocksAvailable = stocksAvailable;

		await product.save();

		return res.status(200).json({ message: "Product updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
}

// Get all products
async function getAllProducts(req, res) {
	try {
		const products = await Product.find();
		res.status(200).json({ products, status: "success" });
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}

// Get product by ID
async function getProductById(req, res) {
	try {
		const productId = req.params.id;
		const product = await Product.findById(productId);
		if (product) {
			res.status(200).json({ product, status: "success" });
		} else {
			res.status(404).json({ error: "Product not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}

module.exports = {
	createProduct,
	getAllProducts,
	getProductById,
	editProduct,
};
