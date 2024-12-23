const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');


//route to login
router.post('/login', authController.login);

module.exports = router;