const User = require('../models/uerModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userController = {
    createUser: async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            const newUser = new User({
                first_name: req.body.first_name,
                username: req.body.username,
                password: hashedPassword,
            });
            const savedUser = await newUser.save();

            res.status(201).json(savedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = userController;