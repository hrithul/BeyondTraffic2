const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.status(404).send("User not found");

      const user_id = user._id;
      const first_name = user.first_name;
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send("Incorrect Password");

      res.json({ user_id, first_name, token });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      
      if (!username || !newPassword) {
        return res.status(400).json({ 
          message: "Username and new password are required" 
        });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update only the password field
      const result = await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount === 1) {
        res.json({ message: "Password successfully reset" });
      } else {
        res.status(500).json({ message: "Failed to update password" });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        message: "Error resetting password",
        error: error.message 
      });
    }
  }
};

module.exports = authController;
