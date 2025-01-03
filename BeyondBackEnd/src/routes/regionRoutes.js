const express = require('express');
const {
  createRegion,
  getRegionById,
  getAllRegions,
  updateRegionById,
  deleteRegionById,
} = require('../controllers/regionController');
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

// Apply validateToken middleware to all region routes
router.use(validateToken);

// Route to create a new region
router.post('/create', createRegion);

// Route to get a region by ID
router.get('/:id', getRegionById);

// Route to get all regions
router.get('/', getAllRegions);

// Route to update a region by ID
router.put('/:id', updateRegionById);

// Route to delete a region by ID
router.delete('/:id', deleteRegionById);

module.exports = router;
