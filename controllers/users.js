const listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const cloudinary = require('cloudinary').v2;

// Display user profile
module.exports.profile = async (req, res) => {
        const userId = res.locals.currUser._id;
        const user = await User.findById(userId);
        const allListings = await listing.find({ owner: user._id });
        res.render("users/profile.ejs", { allListings, user });
};

// Display user delete form
module.exports.deleteForm = (req, res) => {
        const user = req.user;
        res.render("users/delete.ejs", { user });
}

// Delete user account, listings, and reviews
module.exports.delete = async (req, res) => {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            req.flash("error", "User not found");
            let redirectUrl = res.locals.redirectUrl || res.locals.currUrl || "/listings";
            return res.redirect(redirectUrl);
        }

        // Update reviews authored by the user in other listings
        await listing.updateMany({ 'reviews.author': user._id }, { $set: { 'reviews.$.author': null } });

        // Delete listings owned by the user
        const allListings = await listing.find({ owner: user._id });

        for (const Listing of allListings) {
            const imageId = Listing.image.filename;

            await listing.findByIdAndDelete(Listing._id);

            if (imageId !== "image") {
                try {
                    await cloudinary.uploader.destroy(imageId);
                } catch (error) {
                    console.error(`Error deleting image from Cloudinary: ${error.message}`);
                }
            }
        }

        // Delete reviews authored by the user
        await Review.deleteMany({ author: user._id });

        req.flash('success', 'Your user account, Nests, and reviews have been successfully and permanently deleted.');
        let redirectUrl = res.locals.redirectUrl || res.locals.currUrl || "/listings";
        res.redirect(redirectUrl);
};

// Display user signup form
module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
}

// User signup
module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to DoodleNest");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

// Display user login form
module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

// User login
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to DoodleNest");
    let redirectUrl = res.locals.redirectUrl || res.locals.currUrl || "/listings";
    res.redirect(redirectUrl);
}

// User logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "You are logged out");

        if (res.locals.currUrl === "/profile") {
            return res.redirect("/listings");
        }
        let redirectUrl = res.locals.redirectUrl || res.locals.currUrl || "/listings";
        res.redirect(redirectUrl);
    });
}
