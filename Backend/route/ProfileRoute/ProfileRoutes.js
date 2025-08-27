const express = require("express");
const router = express.Router();
const upload = require("../../Middleware/upload");
const ProfileController = require("../../controller/ProfileController/ProfileController");
const VerifyToken = require("../../Middleware/VerifyToken");

router.get("/", VerifyToken, ProfileController.getProfile); //both role
router.put(
  "/",
  VerifyToken,
  upload.single("profileImage"),
  ProfileController.updateProfile
); //both role

router.post("/change-password/send-otp", ProfileController.sendOtp);
router.post("/change-password/verify-otp", ProfileController.verifyOtpAndReset); 

module.exports = router;
