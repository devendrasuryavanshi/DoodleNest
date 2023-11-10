const listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const cloudinary = require('cloudinary').v2;

// Display all listings
module.exports.index = async (req, res) => {
    const allListings = await listing.find({});
    let query = "empty";
    res.render("listings/index.ejs", { allListings, query });
};

// Display form for creating a new listing
module.exports.newForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Display details of a specific listing
module.exports.show = async (req, res) => {
    const { id } = req.params;
    const list = await listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!list) {
      req.flash("error", "The requested Nest does not exist!");
      return res.redirect("/listings");
    }
    const priceWithTax = parseInt(list.price) + parseInt(list.gst);
    res.render("listings/show.ejs", { list, priceWithTax });
};

// Create a new listing
module.exports.create = async (req, res, next) => {
    const { path, filename } = req.file;
    const newListing = new listing(req.body.listing);
    const gstAmount = (18 / 100) * parseInt(newListing.price);
    newListing.gst = parseInt(gstAmount);
    newListing.owner = req.user._id;
    newListing.image = { url: path, filename };
    await newListing.save();
    req.flash("success", "New Nest Created!");

    // Redirect logic
    let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Display form for editing a listing
module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const list = await listing.findById(id);
    if (!list) {
      req.flash("error", "The requested Nest does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { list });
};

// Update a listing
module.exports.update = async (req, res) => {
    const { id } = req.params;
    const Listing = res.locals.Listing;
    const oldImageId = res.locals.oldImageId;
    res.locals.oldImageId = null;
    let price = req.body.listing.price;
    const gstAmount = (18 / 100) * price;
    Listing.gst = gstAmount;
    await Listing.save();

    // Update image logic
    if (typeof req.file !== "undefined") {
      const { path, filename } = req.file;
      Listing.image = { url: path, filename };
      await Listing.save();

      // Delete old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(oldImageId);
      } catch (error) {
        console.error(`Error deleting old image from Cloudinary: ${error.message}`);
      }
    }

    req.flash("success", "Nest Updated!");

    // Redirect logic
    let redirectUrl = res.locals.currUrl || res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Delete a listing
module.exports.delete = async (req, res) => {
    const { id } = req.params;
    const Listing = await listing.findByIdAndDelete(id);
    const imageId = Listing.image.filename;

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(imageId);
    } catch (error) {
      console.error(`Error deleting image from Cloudinary: ${error.message}`);
    }

    req.flash("success", "Nest Deleted!");

    // Redirect logic
    if (res.locals.currUrl === "/profile") {
      res.redirect(res.locals.currUrl);
    } else {
      res.redirect("/listings");
    }
};

// Display listings by category
module.exports.category = async (req, res) => {
    const query = req.query.q;
    const allListings = await listing.find({ category: query });
    res.render("listings/index.ejs", { allListings, query });
};

// Search for listings
module.exports.search = (req, res) => {
  const searchQuery = req.body.search
  const allListings = res.locals.allListings;
  const query = "search";
  res.render("listings/index.ejs", { allListings, query, searchQuery });
};
