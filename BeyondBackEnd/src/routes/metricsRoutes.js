const express = require('express');
const router = express.Router();
const { getAllMetrics, getMetricsById } = require('../controllers/metricsController');
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

// Apply validateToken middleware to all metrics routes
router.use(validateToken);

router.get('/', getAllMetrics);
router.get('/:id', getMetricsById);

module.exports = router;