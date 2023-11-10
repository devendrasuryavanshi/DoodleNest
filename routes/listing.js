const express = require("express");
const router = express.Router();
const multer = require('multer');
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, currUrl, isOwner, validateListing, isYou, preUpdate, validateSearch, searchListing, saveRedirectUrl } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Home and create routes
router.route("/")
    .get(currUrl, wrapAsync(listingController.index))
    .post(isLoggedIn, saveRedirectUrl, upload.single('listing[image]'), validateListing, wrapAsync(listingController.create));

// NewForm route
router.get("/new", saveRedirectUrl, isLoggedIn, listingController.newForm);

// Search route
router.post("/search", currUrl, validateSearch, searchListing, listingController.search);

// Category route
router.get("/category", currUrl, wrapAsync(listingController.category));

// Show, update, and delete routes
router.route("/:id")
    .get(currUrl, isYou, saveRedirectUrl, wrapAsync(listingController.show))
    .put(isLoggedIn, isOwner, saveRedirectUrl, upload.single('listing[image]'), validateListing, preUpdate, wrapAsync(listingController.update))
    .delete(isLoggedIn, isOwner, saveRedirectUrl, wrapAsync(listingController.delete));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
