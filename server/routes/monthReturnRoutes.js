const express = require('express');
const {
  createMonthlyReturn,
  getMonthlyReturns,
  deleteMonthlyReturn,
} = require('../controllers/monthreturnController');

// --- ALUTH IMPORTS ---
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

// --- Role Arrays ---
const ROLES_VIEW_ADMIN = ['Super Admin', 'Admin'];
const ROLES_CRUD_SUPER_ADMIN = ['Super Admin'];

const router = express.Router();

// Rule: CRUD for Super Admin
router.post(
    '/submit', 
    authMiddleware,
    checkRole(ROLES_CRUD_SUPER_ADMIN),
    createMonthlyReturn
);

// Rule: View for Admin & Super Admin
router.get(
    '/', 
    authMiddleware,
    checkRole(ROLES_VIEW_ADMIN),
    getMonthlyReturns
);

// Rule: CRUD for Super Admin
router.delete(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_CRUD_SUPER_ADMIN),
    deleteMonthlyReturn
);

module.exports = router;