const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🌟 යාවත්කාලීන කිරීම: userController එක import කිරීම
const userController = require('../controllers/userController');

const JWT_SECRET = process.env.JWT_SECRET || 'MathavamSuperSecureSecretKey#2025@!@#RandomString$%^&*()';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter both username and password.' });
    }

    try {
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        if (!user.id) {
             console.error(`CRITICAL ERROR: AuthRoutes - User missing .id! User: ${user.username}`);
             return res.status(500).json({ message: 'Server error generating token payload' });
        }
        const payload = {
            userId: user.id,
            userType: user.userType
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
                childRegNo: user.childRegNo
            }
        });

    } catch (err) {
        console.error('Login error in authRoutes:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// 🌟 නව Route එක: Forgot Password ක්‍රියාවලිය සඳහා
router.post('/forgot-password', userController.resetPasswordIfValid);


module.exports = router;