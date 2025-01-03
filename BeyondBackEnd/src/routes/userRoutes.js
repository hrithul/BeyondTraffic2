const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.sendStatus(401); // If no token, return unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid token.' }); // Return forbidden if token is invalid
        }
        req.user = user;
        next(); // Proceed to the next middleware or request handler
    });
};

router.use(validateToken);
// Create a new user
router.post("/createuser",  createUser);

// Get all users
router.get("/",  getAllUsers);

// Get user by ID
router.get("/:id",  getUserById);

// Update user
router.put("/:id",  updateUser);

// Delete user
router.delete("/:id",  deleteUser);

module.exports = router;
