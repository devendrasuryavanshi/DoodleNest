const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { saveRedirectUrl, currUrl, isLoggedIn, passwordVerification } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");

// User profile route
router.get("/profile", isLoggedIn, saveRedirectUrl, currUrl, wrapAsync(userController.profile));

// Display user delete form route
router.get("/users", isLoggedIn, userController.deleteForm);

// Delete user route
router.delete("/users/:id", isLoggedIn, passwordVerification, wrapAsync(userController.delete));

// User signup form and signup routes
router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.signup));

// User login form and login routes
router.route("/login")
    .get(userController.loginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(userController.login));

// User logout route
router.get("/logout", saveRedirectUrl, userController.logout);

module.exports = router;
