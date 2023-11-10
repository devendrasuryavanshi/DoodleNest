// Import required modules and models
const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

// MongoDB connection URL
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

// Function to initialize the database
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongo_url);
        console.log("Connected to the database");
    } catch (err) {
        console.log("Error connecting to the database:", err);
    }
}

// Main function to initialize the database
const initDB = async () => {
    // Clear existing data in the collections
    await listing.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});

    try {
        // Sample user data for registration
        const [username, email, password] = ["doodle", "doodle@gmail.com", "1234"];

        // Create a new user with email and username
        const newUser = new User({ email, username });

        // Register the user with the provided password
        const registeredUser = await User.register(newUser, password);

        // Get the ID of the registered user
        const ownerId = registeredUser._id;

        // GST rate for calculations (18%)
        const gstRate = 0.18;

        // Update listing data with owner ID and calculated GST
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: ownerId,
            gst: gstRate * obj.price
        }));

        // Insert the updated listings into the database
        await listing.insertMany(initData.data);

        console.log("Data was initialized.");
    } catch (e) {
        console.log("Error initializing data:", e);
    }
};

// Call the main function to connect to the database
main().then(() => {
    // After connecting to the database, initialize data
    initDB();
});
