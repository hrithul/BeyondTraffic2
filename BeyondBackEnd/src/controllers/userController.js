const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Create a new user
(exports.createUser = async (req, res) => {
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // Create new user
    const newUser = new User({
      first_name: req.body.first_name,
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
      permissions: req.body.permissions,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}),
  // Get all users
  (exports.getAllUsers = async (req, res) => {
    try {
      console.log("Getting all users...");
      const users = await User.find({}).select("-password");
      console.log("Found users:", users);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),
  // Get user by ID
  (exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id, "-password")
        .populate("name")
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),
  // Update user
  (exports.updateUser = async (req, res) => {
    try {
      const updates = { ...req.body };

      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
      }

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }),
  // Delete user
  (exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
