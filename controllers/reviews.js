const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Create a new review
module.exports.create = async (req, res) => {
    const listingId = req.params.id;
    const listing = await Listing.findById(listingId);
    
    // Create a new review instance
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    // Push the new review to the listing
    listing.reviews.push(newReview);

    // Save the new review and the updated listing
    await newReview.save();
    await listing.save();
    
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete a review
module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params;
    
    // Remove the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
