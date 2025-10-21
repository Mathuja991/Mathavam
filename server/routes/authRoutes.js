const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path as necessary
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure dotenv is configured

// Use environment variable for JWT secret in production!
const JWT_SECRET = process.env.JWT_SECRET || 'MathavamSuperSecureSecretKey#2025@!@#RandomString$%^&*()';

// Login Route - POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter both username and password.' });
    }

    try {
        // Find user by username (case-insensitive)
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // --- Generate JWT Token ---
        // Ensure user.id exists (using Mongoose virtual .id)
        if (!user.id) {
             console.error(`CRITICAL ERROR: AuthRoutes - User missing .id! User: ${user.username}`);
             return res.status(500).json({ message: 'Server error generating token payload' });
        }
        // Create payload matching authMiddleware expectation ({ userId: '...' })
        const payload = {
            userId: user.id,
            userType: user.userType // Include userType if needed later by middleware
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '7d' } // Set token expiration (e.g., 7 days)
        );

        // --- THE FIX: Send back the token AND user info including childRegNo ---
        res.json({
            message: 'Login successful!',
            token,
            user: { // This object will be saved in localStorage by LoginForm.jsx
                id: user.id,          // Use .id virtual (optional if _id is preferred)
                _id: user._id,         // Include _id if frontend uses it
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
                childRegNo: user.childRegNo // **INCLUDE childRegNo HERE!**
                // Add any other user details needed immediately after login
            }
            // requiresPasswordReset: false // Add if you have this logic
        });

    } catch (err) {
        console.error('Login error in authRoutes:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// You might have other routes here (e.g., register, forgot password)
// Keep them as they are.

module.exports = router;