const User = require('../models/uerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) return res.status(404).send('User not found');

            const user_id = user._id;
            const first_name = user.first_name;

            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) return res.status(400).send('Incorrect Password');

            res.json({ user_id, first_name, token });

        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }

}

module.exports = authController