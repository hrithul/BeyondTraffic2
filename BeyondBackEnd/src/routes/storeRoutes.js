const express = require("express");
const {
  createStore,
  getAllStore,
  getStoreById,
  updateStoreById,
  deleteStoreById,
} = require("../controllers/storeController");
const router = express.Router();
const jwt = require('jsonwebtoken');

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

// Apply validateToken middleware to all store routes
router.use(validateToken);

// CREATE
// Route to create a new store
router.post("/create", createStore);

// READ
// Route to get all stores with optional filtering
router.get("/", getAllStore);
// Route to get a store by ID
router.get("/:id", getStoreById);

// UPDATE
// Route to update a store by ID
router.put("/:id", updateStoreById);

// DELETE
// Route to delete a store by ID
router.delete("/:id", deleteStoreById);

module.exports = router;
