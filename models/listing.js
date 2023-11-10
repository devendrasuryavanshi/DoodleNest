const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Define the Listing Schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        url: String,
        filename: String
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    gst: {
        type: Number
    },
    category: {
        type: String,
        enum: ["Trending", "Eco", "Rooms", "Cabin", "Mountains", "Farms", "Amazing-pools", "Villa", "Lakefront", "Islands", "Beachfront", "Downtown", "Treehouse", "Luxe", "City", "Iconic-cities", "Tiny-homes", "Normal"]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

// Define a post middleware to remove associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

// Create a Listing model from the schema
const Listing = mongoose.model("Listing", listingSchema);

// Export the Listing model
module.exports = Listing;
