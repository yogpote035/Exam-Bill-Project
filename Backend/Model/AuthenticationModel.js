const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    teacherId: {
      type: String,
      unique: true,
      sparse: true, // only required for teacher role
    },

    // Department only for teachers
    department: {
      type: String,
      enum: [
        "Computer Science",
        "Biotech",
        "Commerce",
        "Arts",
        "Sociology",
        "BBA",
        "BBA-CA",
        "Law",
        "Chemistry",
        "Electronics",
        "BCA",
      ],
      required: function () {
        return this.role === "teacher";
      },
    },

    profileImage: {
      url: { type: String },
      publicId: { type: String },
    },
  },
  { timestamps: true }
);

// Unique teacherId but only for teachers
userSchema.index({ role: 1, teacherId: 1 }, { unique: true, sparse: true });

const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;
