// Check if not in production, then load environment variables from .env file
if (process.env.NODE_RNV !== "production") {
    require('dotenv').config();
}

// Import required modules
const express = require("express"); // Express framework for web applications
const mongoose = require("mongoose"); // MongoDB object modeling tool
const path = require("path"); // Node.js module for handling file paths
const methodOverride = require('method-override'); // Middleware for HTTP methods override
const ejsMate = require('ejs-mate'); // EJS template engine middleware
const cookieParser = require('cookie-parser'); // Middleware to parse cookies
const session = require("express-session"); // Express middleware for session handling
const MongoStore = require('connect-mongo'); // Mongo middleware for session handling
const flash = require("connect-flash"); // Middleware for flash messages
const passport = require("passport"); // Authentication middleware
const LocalStrategy = require("passport-local"); // Local authentication strategy
const ExpressError = require("./utils/ExpressError.js"); // Custom error class
const User = require("./models/user.js"); // User model

// Import routes
const listingsRouter = require("./routes/listing.js"); // Router for listings
const reviewsRouter = require("./routes/review.js"); // Router for reviews
const userRouter = require("./routes/user.js"); // Router for user-related routes

// MongoDB connection
// const mongo_url = "mongodb://127.0.0.1:27017/wanderlust"; // MongoDB connection URL
const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(dbUrl); // Establish MongoDB connection
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

// Initialize Express
const app = express(); // Create an Express application

// Configure view engine
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Set the views directory path

// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(methodOverride('_method')); // Middleware for HTTP method override
app.engine('ejs', ejsMate); // Use EJS as the template engine
app.use(cookieParser("secretcode")); // Parse cookies


// MongoDB Session configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});


// Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET, // Secret used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOptions)); // Use session middleware
app.use(flash()); // Use flash messages middleware

// Passport setup
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable session support in Passport
passport.use(new LocalStrategy(User.authenticate())); // Use local authentication strategy
passport.serializeUser(User.serializeUser()); // Serialize user for session
passport.deserializeUser(User.deserializeUser()); // Deserialize user for session

// Middleware to set local variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // Success flash messages
    res.locals.error = req.flash("error"); // Error flash messages
    res.locals.currUser = req.user; // Current user
    next();
});

// Route handling
app.use("/listings", listingsRouter); // Use listings router for '/listings' path
app.use("/listings/:id/reviews", reviewsRouter); // Use reviews router for '/listings/:id/reviews' path
app.use("/", userRouter); // Use user router for '/' path

// Error handling
app.all("*", (req, res, next) => {
    // Handle 404 errors
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    // General error handling
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

// Start the server
const PORT = process.env.PORT || 8080; // Port number for the server
connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
});
