const express = require("express");
const router = express.Router();
const upload = require("../../Middleware/upload");
const AuthController = require("../../controller/AuthenticationController/AuthenticationController");

// Single profile image upload
router.post("/signup", upload.single("profileImage"), AuthController.signup); //both role
// router.put("/signup", upload.single("profileImage"), AuthController.signup); //both role
router.post("/login/email-password", AuthController.loginEmailPassword); //decide next
router.post("/login/number-password", AuthController.loginMobilePassword); //decide next
router.post("/login/sent-otp", AuthController.sendOtp);
router.post("/login/email-otp", AuthController.loginEmailOtp); //decide next

module.exports = router;
