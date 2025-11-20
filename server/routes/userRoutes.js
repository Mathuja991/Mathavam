const express = require('express');
const router = express.Router();
const {
  addUser,
  getAllUsers,
  loginUser,
  updateUsername,
  updatePassword,
  getDashboardStats, 
  checkDoctor,
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

const ROLES_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];

router.post(
    '/add',
    authMiddleware,
    checkRole(['Super Admin', 'Admin']),
    addUser
);

router.get(
    '/', 
    authMiddleware, 
    checkRole(['Super Admin', 'Admin']),
    getAllUsers
);

router.get('/check-doctor/:idNumber', checkDoctor);

router.post('/login', loginUser);

router.get(
    '/dashboard/stats', 
    authMiddleware, 
    checkRole(ROLES_STAFF),
    getDashboardStats
);

router.put('/update-username', authMiddleware, updateUsername);
router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;