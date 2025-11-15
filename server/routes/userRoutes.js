// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  addUser,
  getAllUsers,
  loginUser,
  // ... anith functions
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware'); // <-- Meka import karanna

// @route   POST /api/users/add
// @desc    Add a new user (Only Admins)
// Rule: Implied 'Manage Users'
router.post(
    '/add',
    authMiddleware,
    checkRole(['Super Admin', 'Admin']), // <-- MEKA THAMAI RBAC
    addUser
);

// @route   GET /api/users
// @desc    Get all users (Only Admins)
// Rule: Implied 'Manage Users'
router.get(
    '/', 
    authMiddleware, 
    checkRole(['Super Admin', 'Admin']), // <-- MEKA THAMAI RBAC
    getAllUsers
);

// @route   POST /api/users/login
// @access  Public
router.post('/login', loginUser); // Login ekata auth one naha

// ... anith routes (updatePassword, etc.) authMiddleware witharak use karanna
// router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;