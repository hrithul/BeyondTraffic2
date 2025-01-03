const express = require("express");
const {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceById,
  deleteDeviceById,
  getLastSyncDateTime,
} = require("../controllers/deviceController");
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

// Apply validateToken middleware to all device routes
router.use(validateToken);

// CREATE
// Route to create a new device
router.post("/create", createDevice);

// Get last sync time for devices
router.get("/lastsync", getLastSyncDateTime);

// READ
// Route to get all devices with optional store_code filter
router.get("/", getAllDevices);

// Route to get a device by ID
router.get("/:id", getDeviceById);

// UPDATE
// Route to update a device by ID
router.put("/:id", updateDeviceById);

// DELETE
// Route to delete a device by ID
router.delete("/:id", deleteDeviceById);

module.exports = router;
