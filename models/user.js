const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Define the User Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

// Plugin for Passport-Local Mongoose to simplify username and password authentication
userSchema.plugin(passportLocalMongoose);

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
