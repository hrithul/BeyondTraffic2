const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    permissions: { type: [String], default: [] },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    email: { type: String, sparse: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
