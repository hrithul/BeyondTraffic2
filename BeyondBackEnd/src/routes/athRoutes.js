const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

//route to login
router.post('/login', authController.login);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;