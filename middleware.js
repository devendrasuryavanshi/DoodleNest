// Import required modules and models
const listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema } = require("./schema.js");

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => { 
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please log in to take action");
        res.redirect("/login");
    } else {
        next();
    }
};

// Middleware to save the current URL in the session
module.exports.currUrl = (req, res, next) => {
    req.session.currUrl = req.originalUrl;
    next();
};

// Middleware to save the redirect URL in locals
module.exports.saveRedirectUrl = (req, res, next) => {
    res.locals.redirectUrl = req.session.redirectUrl;
    res.locals.currUrl = req.session.currUrl;
    next();
};

// Middleware to check if the current user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        let Listing = await listing.findById(id);
        if (!Listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the owner of this Nest");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
};

// Middleware to validate the listing data
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Middleware to validate the review data
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Middleware to check if the current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        let review = await Review.findById(reviewId);
        if (!review.author._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
};

// Middleware to check if the current user is not the owner of a listing
module.exports.isNotOwner = async (req, res, next) => {
    const { id } = req.params;
    let Listing = await listing.findById(id);
    if (res.locals.currUser._id.equals(Listing.owner._id)) {
        req.flash("error", "You can't review your own Nest.");
        res.redirect(`/listings/${id}`);
    } else {
        next();
    }
};

// Middleware to check if the current user is the owner of a listing for personalized messages
module.exports.isYou = async (req, res, next) => {
    try {
        const { id } = req.params;
        let Listing = await listing.findById(id).populate("owner");
        if (res.locals.currUser && res.locals.currUser._id.equals(Listing.owner._id)) {
            res.locals.you = "You";
            next();
        } else {
            res.locals.you = Listing.owner.username;
            next();
        } 
    } catch (err) {
        req.flash("error", "Something went wrong");
        let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
};

// Middleware to perform updates before updating a listing
module.exports.preUpdate = async (req, res, next) => {
    try {
        if (!req.body.listing) {
            throw new ExpressError(400, "Send valid data for Nests");
        }
        const { id } = req.params;
        res.locals.Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.locals.oldImageId = res.locals.Listing.image.filename;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
};

// Middleware to validate the search input
module.exports.validateSearch = (req, res, next) => {
    const searchQuery = req.body.search;
    const pattern = /^[a-zA-Z0-9\s-]*$/;

    if (!searchQuery || searchQuery.trim() === "") {
        // Search input is missing or empty, handle the error
        req.flash('error', 'Search field is empty or missing.');
        let redirectUrl = res.locals.currUrl || '/listings';
        res.redirect(redirectUrl);
    } else if (!pattern.test(searchQuery)) {
        req.flash('error', 'Invalid characters in the search field. Please remove special characters.');
        let redirectUrl = res.locals.currUrl || '/listings';
        res.redirect(redirectUrl);
    } else {
        return next();
    }
};

// Middleware to perform a case-insensitive search for listings
module.exports.searchListing = async (req, res, next) => {
    const searchQuery = req.body.search.toLowerCase(); // Convert the search query to lowercase for case-insensitive search
    const allListings = await listing.find({});
    const searchResults = [];

    // Define an array of properties to search in for each listing
    const searchProperties = ['title', 'description', 'price', 'location', 'country', 'category', 'gst'];

    for (const listing of allListings) {
        for (const prop of searchProperties) {
            // Exclude image URLs and IDs from the search
            if (prop !== 'image.url' && prop !== '_id') {
                const value = listing[prop] ? listing[prop].toString().toLowerCase() : '';

                if (value.includes(searchQuery)) {
                    searchResults.push(listing);
                    break; // Stop checking other properties for this listing
                }
            }
        }
    }
    res.locals.allListings = searchResults;

    // You can send these results to your front-end or process them as needed

    next();
};

// Middleware to verify the user's password
module.exports.passwordVerification = (req, res, next) => {
    const password = req.body.password;

    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        const user = req.user;

        // Use the authenticate method provided by passport-local-mongoose
        user.authenticate(password, (err, user, error) => {
            if (err) {
                // Handle any database or authentication errors here
                console.log(err);
                req.flash('error', 'An error occurred during password verification.');
                res.redirect('/login');
            } else if (!user) {
                // Password verification failed, display an error message
                req.flash('error', 'Incorrect password');
                res.redirect('/users');
            } else {
                next();
            }
        });
    } else {
        // Redirect to the login page or display an error message
        req.flash('error', 'Please log in to take action');
        res.redirect('/login');
    }
};
