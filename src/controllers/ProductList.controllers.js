import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import uploadImage from '../utils/cloudinary.js';
import Review from '../models/Review.model.js';
import order from '../models/Order.model.js';
import redisClient from '../db/Radis.db.js';
import Fuse from 'fuse.js';

// add product to database and upload images to cloudinary  

const productUpload = asyncHandler(async (req, res) => {
    const { name, title, description, details, features, livePreview, price, category, tags, stock } = req.body;

    // Ensure files are uploaded
    if (!req.files || !req.files.productImage) {
        return res.status(400).json(new ApiResponse(400, 'Product image is required'));
    }

    // Validate and upload images
    const image = await Promise.all(
        req.files.productImage.map(async (file) => {
            // Add security checks for file type and size
            if (!file.mimetype.startsWith('image/')) {
                throw new Error('Invalid file type. Only images are allowed.');
            }
            if (file.size > 2 * 1024 * 1024) { // Example: 2MB limit
                throw new Error('File size exceeds the allowed limit of 2MB.');
            }

            return await uploadImage(file.path);
        })
    ).catch((err) => {
        return res.status(400).json(new ApiResponse(400, err.message));
    });

    // Check if all images were uploaded successfully
    if (!image || image.length === 0) {
        return res.status(400).json(new ApiResponse(400, 'Image upload failed'));
    }

    try {

        if(!name || !title || !description || !details || !features || !price || !category || !tags){
            return res.status(400).json(new ApiResponse(400, 'All fields are required'));
        }
        // Save product to the database
        const product = new Product({
            name,
            title,
            description,
            details,
            features,
            livePreview,
            price,
            category,
            tags,
            stock,
            image,
        });

        await product.save();

        res.status(201).json(new ApiResponse(201, 'Product created successfully', product));
    } catch (err) {
        console.error('Error saving product:', err);
        res.status(500).json(new ApiResponse(500, 'An error occurred while creating the product'));
    }
});


// update product in database 
const productUpdate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, title, description, details, features, livePreview, price, category, tags, stock } = req.body;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json(new ApiResponse(404, 'Product not found'));
        }

        // Validate and upload images
        if (req.files && req.files.productImage) {
            const image = await Promise.all(
                req.files.productImage.map(async (file) => {
                    // Add security checks for file type and size
                    if (!file.mimetype.startsWith('image/')) {
                        throw new Error('Invalid file type. Only images are allowed.');
                    }
                    if (file.size > 2 * 1024 * 1024) { // Example: 2MB limit
                        throw new Error('File size exceeds the allowed limit of 2MB.');
                    }

                    return await uploadImage(file.path);
                })
            ).catch((err) => {
                return res.status(400).json(new ApiResponse(400, err.message));
            });

            // Check if all images were uploaded successfully
            if (!image || image.length === 0) {
                return res.status(400).json(new ApiResponse(400, 'Image upload failed'));
            }

            product.image = image;
        }

        product.name = name || product.name;
        product.title = title || product.title;
        product.description = description || product.description;
        product.details = details || product.details;
        product.features = features || product.features;
        product.livePreview = livePreview || product.livePreview;
        product.price = price || product.price;
        product.category = category || product.category;
        product.tags = tags || product.tags;
        product.stock = stock || product.stock;

        await product.save();

        res.json(new ApiResponse(200, 'Product updated successfully', product));
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json(new ApiResponse(500, 'An error occurred while updating the product'));
    }

});




 // delete product from database
const productDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json(new ApiResponse(404, 'Product not found'));
        }

        res.json(new ApiResponse(200, 'Product deleted successfully'));
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json(new ApiResponse(500, 'An error occurred while deleting the product'));
    }
});

// product like and dislike 
const productLike = asyncHandler(async (req, res) => {
       // Get the product ID from the request 
        const { id } = req.params;
        // Get the user ID from the request
        const userId = req.user.id;
        // Use `Promise.all` for parallel fetching of Product and User
        const [product, user] = await Promise.all([
            Product.findById(id), // Removed `.lean()` to allow for direct updates
            User.findById(userId), // Removed `.lean()` to allow for direct updates
        ]);
    
        // Validate if the product and user exist
        if (!product || !user) {
            return res.status(404).json(new ApiResponse(404, 'Product or user not found'));
        }
    
        const isLiked = product.likeSummary.likedBy.includes(userId);
    
        if (isLiked) {
            // Unlike the product
            product.likeSummary.count -= 1;
            product.likeSummary.likedBy = product.likeSummary.likedBy.filter((like) => like.toString() !== userId.toString());
            user.wishlist = user.wishlist.filter((wish) => wish.toString() !== id.toString());
        } else {
            // Like the product
            product.likeSummary.count += 1;
            product.likeSummary.likedBy.push(userId);
            user.wishlist.push(id);
        }
    
        // Save changes
        await Promise.all([product.save(), user.save()]);
    
        // Send response
        res.json(new ApiResponse(200, null, isLiked ? 'Product unliked successfully' : 'Product liked successfully'));
});


// product review and rating post
const productReview = asyncHandler(async (req, res) => {
    try {
        const { id: productId } = req.params;
        // const userId = req.user.id
        const userId = req.user.id;
        const { rating, comment } = req.body;
        const reviewImg = req.files?.reviewImg || [];

        // Fetch product and check if the user has already reviewed in a single query
        const product = await Product.findOne({ _id: productId }, '_id reviewIds reviewavg reviewcount');
        if (!product) {
            return res.status(404).json(new ApiResponse(404, 'Product not found'));
        }

        const [userExists, existingReview] = await Promise.all([
            User.exists({ _id: userId }), // Check if the user exists
            Review.exists({ productId, userId }) // Check if the user already reviewed
        ]);

        if (!userExists) {
            return res.status(404).json(new ApiResponse(404, 'User not found'));
        }
        if (existingReview) {
            return res.status(400).json(new ApiResponse(400, 'You have already reviewed this product'));
        }

        // Handle image uploads (if any) concurrently
        const imageUrls = reviewImg.length > 0
            ? await Promise.all(reviewImg.map(async (file) => {
                if (!file.mimetype.startsWith('image/') || file.size > 2 * 1024 * 1024) {
                    throw new Error('Invalid image format or size');
                }
                return uploadImage(file.path);
            }))
            : [];

        // Create and save the review
        const review = await Review.create({ productId, userId, rating, comment, imageUrls });

        // Update product review stats using aggregation
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                $push: { reviewIds: review._id },
                $inc: { reviewcount: 1 },
                $set: {
                    reviewavg: (product.reviewavg * product.reviewcount + Number(rating)) / (product.reviewcount + 1),
                }
            },
            { new: true }
        );

        // Send response with the new review and updated product stats
        res.status(201).json(new ApiResponse(201, { review, product: updatedProduct }, 'Review posted successfully'));
    } catch (err) {
        res.status(500).json(new ApiResponse(500, err.message, 'Server error'));
    }
});

const productReviewDelete = asyncHandler(async (req, res) => {
    const { id: reviewId } = req.params;
    const userId = req.user.id;

    try {
        const review = await Review.findOneAndDelete({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json(new ApiResponse(404, 'Review not found'));
        }

        const productUpdate = await Product.findOneAndUpdate(
            { _id: review.productId },
            {
                $inc: { reviewcount: -1 },
                $pull: { reviewIds: reviewId }
            },
            { new: true }
        );

        if (!productUpdate) {
            return res.status(404).json(new ApiResponse(404, 'Product not found'));
        }

        productUpdate.reviewavg = productUpdate.reviewcount > 0 
            ? (productUpdate.reviewavg * (productUpdate.reviewcount + 1) - review.rating) / productUpdate.reviewcount 
            : 0;
        await productUpdate.save();

        res.json(new ApiResponse(200, { review, product: productUpdate }, 'Review deleted successfully'));
    } catch (err) {
        res.status(500).json(new ApiResponse(500, err.message, 'Server error'));
    }
});


 const productReviewUpdate = asyncHandler(async (req, res) => {
//     const { id: reviewId } = req.params;
//     const { userId, rating, comment } = req.body;
//     const reviewImg = req.files?.reviewImg || [];

//     try {
//         const review = await Review.findOne({ _id: reviewId, userId });
//         if (!review) {
//             return res.status(404).json(new ApiResponse(404, 'Review not found'));
//         }

//         const imageUrls = reviewImg.length > 0
//             ? await Promise.all(reviewImg.map(async (file) => {
//                 if (!file.mimetype.startsWith('image/') || file.size > 2 * 1024 * 1024) {
//                     throw new Error('Invalid image format or size');
//                 }
//                 return uploadImage(file.path);
//             })
//             )
//             : [];

//         review.rating = rating || review.rating;
//         review.comment = comment || review.comment;
//         review.imageUrls = imageUrls.length > 0 ? imageUrls : review.imageUrls;

//         await review.save();

//         const product = await Product.findOne({ _id: review.productId }, '_id reviewIds reviewavg reviewcount');
//         if (!product) {
//             return res.status(404).json(new ApiResponse(404, 'Product not found'));
//         }

//         const updatedProduct = await Product.findByIdAndUpdate(
//             review.productId,
//             {
//                 $set: {
//                     reviewavg: (product.reviewavg * product.reviewcount + Number(rating) - review.rating) / product.reviewcount,
//                 }
//             },
//             { new: true }
//         );

//         res.json(new ApiResponse(200, { review, product: updatedProduct }, 'Review updated successfully'));
//     } catch (err) {
//         res.status(500).json(new ApiResponse(500, err.message, 'Server error'));
//     }
});



//*🔍 roduct Search, Sort, Filter, and Pagination API 

const productSearch = asyncHandler(async (req, res) => {
    const { search, category, tags, sortBy, rating, sortOrder, page, limit } = req.query;
    const query = {};
    const sort = {};
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    // 🔍 Build Redis Cache Key
    const cacheKey = `search:${JSON.stringify(req.query)}`;

    // 🔥 Check if data exists in Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("✅ Returning cached search results");
        return res.json(new ApiResponse(200, JSON.parse(cachedData), "Products retrieved from cache"));
    }

    // 🛒 Build Query for MongoDB
    if (search) {
        // Fuzzy search with Fuse.js for better handling of typos
        const productsInDb = await Product.find({}); // Fetch all products (can be optimized)
        const fuse = new Fuse(productsInDb, {
            keys: ["name", "title", "description", "category", "tags"],
            threshold: 0.3, // Lower threshold for better matches
        });

        const fuzzyResults = fuse.search(search);
        const ids = fuzzyResults.map(result => result.item._id);

        if (ids.length) {
            query._id = { $in: ids }; // Fetch products based on fuzzy matches
        } else {
            return res.json(new ApiResponse(200, [], "No matches found"));
        }
    }

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",") };
    if (rating) query.reviewavg = { $gte: rating };
    if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // 📌 Pagination Options
    const options = { sort, page: pageNum, limit: pageSize };

    try {
        // 📌 Fetch Data from MongoDB
        const products = await Product.paginate(query, options);

        const newProducts = products.docs.map((product) => ({
            id: product._id,
            name: product.name,
            title: product.title,
            price: product.price,
            category: product.category,
            tags: product.tags,
            stock: product.stock,
            image: product.image,
            reviewavg: product.reviewavg,
        }));

        const configProduct = {
            totalDocs: products.totalDocs,
            totalPages: products.totalPages,
            page: products.page,
            limit: products.limit,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            nextPage: products.nextPage,
            prevPage: products.prevPage,
        };

        const responseData = { newProducts, configProduct };

        // 🔥 Store results in Redis cache (Auto-remove after 10 minutes)
        await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));
        console.log("✅ Search results stored in Redis cache");

        // 📌 Send Response
        res.json(new ApiResponse(200, responseData, "Products retrieved successfully"));
    } catch (err) {
        console.error("Error in product search:", err);
        res.status(500).json(new ApiResponse(500, err.message, "Server error"));
    }
});



// single product details fetch

const productDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {

       // Check if the product is cached in Redis
        const cacheKey = `product:${id}`;
        const cachedProduct = await redisClient.get(cacheKey);

        if (cachedProduct) {
            return res.json(new ApiResponse(200, JSON.parse(cachedProduct), "Product retrieved successfully (Cached)"));
        }

        // Fetch the product from the database if not cached 
        const product = await Product.findById(id)
            .select("name title description details features livePreview price category tags stock image reviewavg reviewcount likeSummary reviewIds")
            .populate({ path: 'reviewIds', select: 'rating comment imageUrls userId', populate: { path: 'userId', select: 'fullName' }})
            .lean();

        if (!product) {
            return res.status(404).json(new ApiResponse(404, 'Product not found'));
        }
       // 🔥 Store product in Redis with a 15-minute expiry
       await redisClient.setEx(cacheKey, 60 * 15, JSON.stringify(product)); // 15 minutes; // 300 seconds = 5 minutes

        res.json(new ApiResponse(200, product, 'Product retrieved successfully'));


    } catch (err) {
        res.status(500).json(new ApiResponse(500, err.message, 'Server error'));
    }
});





export { productUpload, productUpdate, productDelete,productLike,productReview,productReviewDelete,productSearch,productDetails };
