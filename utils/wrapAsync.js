// wrapAsync.js

// Middleware to wrap asynchronous functions and handle errors
module.exports = (fn) => {
    return (req, res, next) => {
        // Execute the asynchronous function and handle errors using the 'catch' method
        fn(req, res, next).catch(next);
    };
};
