import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET} from '../constants.js'

// Configuring cloudinary
cloudinary.config({
    cloud_name:CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET
});

// Uploading image to cloudinary and returning the URL of the uploaded image  and optimized image

const uploadImage = async (localFilePath) => {
    if (!localFilePath) return null;  // Ensure file path is provided

    try {
        // Upload image to Cloudinary and optimize in one step
        const uploadedImage = await cloudinary.uploader.upload(localFilePath, {
            public_id: `images/${Date.now()}`,  // Simplified public_id for consistency
            resource_type: 'auto',
        });

        // Generate the optimized image URL
        const optimizedImage = cloudinary.url(uploadedImage.public_id, {
            fetch_format: 'avif',  // Auto-format for optimal delivery
            quality: 'auto:eco',  // Auto-quality for performance
            width: 800,                // Resize width (adjust as needed)
            crop: 'fill',              // Ensure aspect ratio is maintained
            dpr: 'auto'                // Automatically adjust for device pixel density
        });

        // Delete the local file (no need to await if deletion is not critical)
        fs.unlinkSync(localFilePath);

        // console.log(uploadedImage);
        // console.log('------------------- optimizedImage -------------------');
        // console.log(optimizedImage);
 
        return optimizedImage ; // Return the uploaded and optimized image URLs

    } catch (error) {
        console.error('Error uploading image:', error);
        return null;  // Return null if there was an error
    }
};



export default uploadImage;