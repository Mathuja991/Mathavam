// routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
// --- 1. Auth Middleware ඉවත් කරන ලදී ---
// const auth = require('../middleware/authMiddleware'); 
const {
  getNotifications,
  markAllAsRead
} = require('../controllers/notificationController');

// @route   POST /api/notifications (GET සිට POST වලට වෙනස් කරන ලදී)
// @desc    Get notifications by childRegNo
// @access  Public (ආරක්ෂිත නැත)
router.post('/', getNotifications); // <-- auth ඉවත් කර, .get -> .post කරන ලදී

// @route   PUT /api/notifications/mark-read
// @desc    Mark all as read by childRegNo
// @access  Public (ආරක්ෂිත නැත)
router.put('/mark-read', markAllAsRead); // <-- auth ඉවත් කරන ලදී

module.exports = router;