const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Review Schema
const reviewSchema = new Schema({
    comment: String, // Comment text
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User" // Reference to the User model for the author
    }
});

// Create a Review model from the schema
const Review = mongoose.model("Review", reviewSchema);

// Export the Review model
module.exports = Review;
