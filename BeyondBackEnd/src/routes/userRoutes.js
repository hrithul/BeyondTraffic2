const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');

const validateToken = (req, res, next) => {
    // Extract the token from the request's authorization header
    const authHeader = req.headers['authorization'];

    const token = authHeader;
    console.log(token);
    if (token == null) {
        return res.sendStatus(401); // If no token, return unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Return forbidden if token is invalid
        }
        req.user = user;
        next(); // Proceed to the next middleware or request handler
    });
};

//route to create user
router.post('/createuser', userController.createUser);

module.exports = router;