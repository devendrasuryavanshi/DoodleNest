const Joi = require('joi');

// Define Joi validation schema for listings
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(), // Title is required and must be a string
        description: Joi.string().required(), // Description is required and must be a string
        location: Joi.string().required(), // Location is required and must be a string
        country: Joi.string().required(), // Country is required and must be a string
        price: Joi.number().required().min(0), // Price is required, must be a number, and minimum value is 0
        image: Joi.object({
            url: Joi.string().required(), // Image URL is required and must be a string
            filename: Joi.string().required() // Image filename is required and must be a string
        }).allow("", null), // Allow empty or null image object
        category: Joi.string().valid(
            'Eco', 'Rooms', 'Cabin', 'Mountains', 'Farms', 'Amazing-pools', 'Villa',
            'Lakefront', 'Islands', "Beachfront", "Downtown", "Treehouse", "Luxe",
            "City", "Iconic-cities", "Tiny-homes", "Normal"
        ).required() // Category is required and must be one of the specified values
    }).required()
});

// Define Joi validation schema for reviews
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(), // Rating is required, must be a number, and within the range 1-5
        comment: Joi.string().required(), // Comment is required and must be a string
    }).required()
});
