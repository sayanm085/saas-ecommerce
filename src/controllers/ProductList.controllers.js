import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import uploadImage from '../utils/cloudinary.js';
import Review from '../models/Review.model.js';
import order from '../models/Order.model.js';


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
        const userId = req.body.userId;
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
    const { userId } = req.body;

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


// const productReviewUpdate = asyncHandler(async (req, res) => {
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
// });






export { productUpload, productUpdate, productDelete,productLike,productReview,productReviewDelete };
