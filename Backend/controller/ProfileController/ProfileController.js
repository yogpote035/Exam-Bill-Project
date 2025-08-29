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

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Store in DB
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Determine user role/department for email personalization
    const userRole =
      user.role === "admin"
        ? "Administrator"
        : user.role
        ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}${
            user.department ? ` in ${user.department} Department` : ""
          }`
        : "User";

    // Send email
    try {
      await transporter.sendMail({
        from: {
          name: "Modern College Exam Staff Remuneration Password Reset",
          address: process.env.Email,
        },
        to: email,
        subject: "Password Reset OTP - Modern College",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #1a237e; padding-bottom: 15px; margin-bottom: 25px; }
              .logo { max-width: 120px; margin-bottom: 15px; }
              .college-name { color: #1a237e; font-size: 18px; font-weight: bold; margin: 5px 0; }
              .college-address { color: #666; font-size: 14px; margin-bottom: 15px; }
              .otp-box { 
                background: #f3f4f6; 
                border: 2px dashed #1a237e; 
                padding: 15px; 
                text-align: center; 
                font-size: 24px; 
                font-weight: bold; 
                color: #1a237e; 
                margin: 20px 0; 
                border-radius: 5px;
              }
              .footer { 
                margin-top: 25px; 
                padding-top: 15px; 
                border-top: 1px solid #ddd; 
                color: #666; 
                font-size: 12px; 
                text-align: center;
              }
              .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 10px; 
                border-radius: 4px; 
                margin: 15px 0;
                color: #856404;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1HUgOQvqEnP9KNdjNmjy3k8QmCZIyCa5lVw&s" 
                     alt="Modern College Logo" class="logo">
                <div class="college-name">Modern College of Arts, Science and Commerce</div>
                <div class="college-address">Ganeshkhind, Pune-16</div>
              </div>
              
              <h2>Password Reset Request</h2>
              
              <p>Dear ${user.name || userRole},</p>
              
              <p>You have requested to reset your password for your account at Modern College Exam Staff Remuneration System.</p>
              
              <p><strong>User Details:</strong></p>
              <ul>
                <li>Email: ${email}</li>
                <li>Role: ${userRole}</li>
                ${
                  user.department && user.role !== "admin"
                    ? `<li>Department: ${user?.department}</li>`
                    : ""
                }
              </ul>
              
              <p>Please use the following OTP to reset your password:</p>
              
              <div class="otp-box">${otp}</div>
              
              <div class="warning">
                <strong>Important:</strong> This OTP is valid for 5 minutes only. 
                Do not share this code with anyone.
              </div>
              
              <p>If you did not request a password reset, please ignore this email or contact the system administrator immediately.</p>
              
              <div class="footer">
                <p>This is an automated message from Modern College of Arts, Science and Commerce</p>
                <p>Ganeshkhind, Pune-16 | © ${new Date().getFullYear()} All Rights Reserved</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`OTP sent successfully to ${email} (${userRole})`);

      res.status(200).json({
        success: true,
        message: "OTP sent to email",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Delete the OTP record if email failed
      await OtpModel.findOneAndDelete({ email });
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
