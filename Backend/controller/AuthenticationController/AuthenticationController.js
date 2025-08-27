const bcrypt = require("bcryptjs");
const UserModel = require("../../Model/UserModel");
const OtpModel = require("../../Model/OtpModel");
const CreateToken = require("../../Middleware/CreateToken");
const nodemailer = require("nodemailer");
const uploadToCloudinary = require("../../Middleware/uploadToCloudinary");

//  SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role, teacherId, department } =
      req.body;

    // Validate required fields
    if (!name || !email || !mobileNumber || !password || !role)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    // Check uniqueness
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });
    if (existingUser)
      return res.status(409).json({
        success: false,
        message: "Email or Mobile Number already in use",
      });

    // Teacher-specific validation
    let tId = null;
    if (role === "teacher") {
      if (!teacherId || !department)
        return res.status(400).json({
          success: false,
          message: "Teacher ID and Department is required for teachers",
        });
      const existingTId = await UserModel.findOne({ teacherId });
      if (existingTId)
        return res
          .status(409)
          .json({ success: false, message: "Teacher ID already in use" });
      tId = teacherId;
    }

    let profileImage = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "profiles");
      profileImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    if (role === "teacher") {
      let teacher = new UserModel({
        name,
        email,
        mobileNumber,
        password: hashedPassword,
        role,
        department,
        teacherId: tId,
        profileImage: profileImage,
      });
      await teacher.save();

      // Generate token
      const token = await CreateToken(
        teacher._id,
        teacher.role,
        teacher.email,
        teacher.name
      );
      console.log("token: ", token);
      res.status(201).json({
        success: true,
        message: "Signup successful",
        token,
        id: teacher._id,
        name: teacher.name,
        role: teacher.role,
      });
    }
    if (role === "admin") {
      let admin = new UserModel({
        name,
        email,
        mobileNumber,
        password: hashedPassword,
        role,
      });
      await admin.save();

      // Generate token
      const token = await CreateToken(
        admin._id,
        admin.role,
        admin.email,
        admin.name
      );

      res.status(201).json({
        success: true,
        message: "Signup successful",
        token,
        id: admin._id,
        name: admin.name,
        role: admin.role,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//  LOGIN EMAIL + PASSWORD
exports.loginEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and Password required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = await CreateToken(user._id, user.role, user.email, user.name);

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      role: user.role,
      token,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  LOGIN MOBILE + PASSWORD
exports.loginMobilePassword = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    if (!mobileNumber || !password)
      return res
        .status(400)
        .json({ message: "Mobile mobileNumber and Password required" });

    const user = await UserModel.findOne({ mobileNumber });
    if (!user)
      return res.status(404).json({ message: "Mobile mobileNumber not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = await CreateToken(user._id, user.role, user.email, user.name);

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      role: user.role,
      token,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save or update OTP in DB with 5-minute expiration
    let otpRecord = await OtpModel.findOne({ email });
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    } else {
      otpRecord = new OtpModel({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
    }
    await otpRecord.save();

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.Email_Password,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Staff Remuneration System" <${process.env.Email}>`,
      to: email,
      subject: "🔑 Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; text-align: center;">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiDX-TI_GWDRoSUoutAJU6HDoAwjH9sPY_PUd2yOYyYNdY6g6un5KNinkcCQmHdmuqIPg&usqp=CAU" 
               alt="College Logo" style="width:100px; height:auto; margin-bottom:10px;" />
          <h2 style="margin:0; color:#1a73e8;">MODERN COLLEGE OF ARTS, SCIENCE, AND COMMERCE</h2>
          <h4 style="margin:0; font-weight:normal;">(AUTONOMOUS)</h4>
          <p style="margin:0 0 15px 0;">GANESHKHIND, PUNE - 411016</p>

          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your OTP code for accessing the Staff Remuneration System is:</p>
          <h1 style="color: #1a73e8; font-size: 32px; margin: 10px 0;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>

          <hr style="margin:20px 0; border:none; border-top:1px solid #ccc;" />
          <p>Regards,<br/>Staff Remuneration Team</p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//  LOGIN EMAIL + OTP
exports.loginEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const otpRecord = await OtpModel.findOne({ email });
    if (!otpRecord)
      return res.status(401).json({ message: "OTP not found. Request again." });
    if (otpRecord.expiresAt < new Date()) {
      await OtpModel.deleteOne({ email });
      return res.status(401).json({ message: "OTP expired. Request new OTP." });
    }
    if (otpRecord.otp.toString() !== otp.toString())
      return res.status(401).json({ message: "Invalid OTP" });

    // Delete OTP after use
    await OtpModel.deleteOne({ email });

    const token = await CreateToken(user._id, user.role, user.email, user.name);

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      role: user.role,
      token,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
