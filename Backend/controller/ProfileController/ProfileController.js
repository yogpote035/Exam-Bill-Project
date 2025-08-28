const UserModel = require("../../Model/UserModel");
const bcrypt = require("bcryptjs");
const uploadToCloudinary = require("../../Middleware/uploadToCloudinary");
const nodemailer = require("nodemailer");
const OtpModel = require("../../Model/OtpModel");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, mobileNumber, password, role, teacherId, department } =
      req.body;

    // Find existing user
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check email/phone uniqueness (exclude self)
    const duplicate = await UserModel.findOne({
      $or: [{ email }, { mobileNumber }],
      _id: { $ne: userId },
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ success: false, message: "Email or Mobile already in use" });
    }

    // Teacher-specific validation
    if (role === "teacher") {
      if (!teacherId || !department) {
        return res.status(400).json({
          success: false,
          message: "Teacher ID and Department are required for teachers",
        });
      }

      const existingTId = await UserModel.findOne({
        teacherId,
        _id: { $ne: userId },
      });
      if (existingTId) {
        return res
          .status(409)
          .json({ success: false, message: "Teacher ID already in use" });
      }

      existingUser.teacherId = teacherId;
      existingUser.department = department;
    }

    // Handle profile image
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "profiles");
      existingUser.profileImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Update other fields
    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;
    existingUser.mobileNumber = mobileNumber || existingUser.mobileNumber;
    existingUser.role = role || existingUser.role;

    // Update password only if provided
    if (password) {
      existingUser.password = await bcrypt.hash(password, 10);
    }

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile: {
        name: existingUser.name,
        email: existingUser.email,
        mobileNumber: existingUser.mobileNumber,
        role: existingUser.role,
        teacherId: existingUser.teacherId,
        department: existingUser.department,
        profileImage: existingUser.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const existingUser = await UserModel.findById(req.user.userId).select(
      "-password"
    );
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Profile Not Found",
      });
    }
    return res.status(200).json(existingUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Configure nodemailer (use Gmail or any free SMTP)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Email_Password,
  },
});

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Store in DB
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send email
    await transporter.sendMail({
      from: process.env.Email,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp} (valid for 10 minutes)`,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OtpModel.findOne({ email, otp });
    if (!otpRecord)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete OTP after success
    await OtpModel.deleteOne({ email, otp });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
