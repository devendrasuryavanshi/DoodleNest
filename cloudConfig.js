// Import Cloudinary and CloudinaryStorage
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with API credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, // Cloudinary cloud name
    api_key: process.env.CLOUD_API_KEY, // Cloudinary API key
    api_secret: process.env.CLOUD_API_SECRET // Cloudinary API secret
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wnaderlust_DEV', // Folder in Cloudinary to store images
        allowedFormats: ["png", "jpg", "jpeg"], // Allowed image formats
    },
});

// Export Cloudinary configuration and storage module
module.exports = {
    cloudinary, // Cloudinary instance
    storage // CloudinaryStorage instance
};
