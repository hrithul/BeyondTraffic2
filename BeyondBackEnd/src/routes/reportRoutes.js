const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
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

// Apply validateToken middleware to all report routes
router.use(validateToken);

// Create a new report
router.post('/', reportController.createReport);

// Get all reports
router.get('/', reportController.getReports);

// Get a single report
router.get('/:id', reportController.getReportById);

// Update a report
router.put('/:id', reportController.updateReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
