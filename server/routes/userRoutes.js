// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  addUser,
  getAllUsers,
  loginUser,
  updateUsername,
  updatePassword,
  getDashboardStats, 
  checkDoctor, // ✅ checkDoctor නිවැරදිව import කර ඇත.
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

// Staff Roles array (Admin Dashboard එකට පිවිසිය හැකි අය)
const ROLES_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];

// @route   POST /api/users/add
// @desc    Add a new user (Only Admins)
router.post(
    '/add',
    authMiddleware,
    checkRole(['Super Admin', 'Admin']),
    addUser
);

// @route   GET /api/users
// @desc    Get all users (Only Admins)
router.get(
    '/', 
    authMiddleware, 
    checkRole(['Super Admin', 'Admin']),
    getAllUsers
);

// @route   GET /api/users/check-doctor/:idNumber
// @desc    Check if an ID number corresponds to a doctor (Public or specific use case)
// මෙය දැන් නිවැරදිව function එකක් ලෙස හඳුනාගනු ඇත.
router.get('/check-doctor/:idNumber', checkDoctor);

// @route   POST /api/users/login
// @access  Public
router.post('/login', loginUser);

// 🟢 NEW ROUTE: Dashboard Stats
// @route   GET /api/users/dashboard/stats
// @desc    Get dashboard statistics for staff
router.get(
    '/dashboard/stats', 
    authMiddleware, 
    checkRole(ROLES_STAFF),
    getDashboardStats
);

// User Profile Update Routes
router.put('/update-username', authMiddleware, updateUsername);
router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;