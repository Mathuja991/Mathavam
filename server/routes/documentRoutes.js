const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, downloadDocument, deleteDocument} = require('../controllers/documentController');

// --- ALUTH IMPORTS ---
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

// --- Role Arrays ---
// 'Resource Person' wa Therapist kenek lesa salakamu
const ROLES_CRUD_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];
const ROLES_VIEW_ALL = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];

// Upload document
// Rule: CRUD for Staff
router.post(
    '/upload', 
    authMiddleware,
    checkRole(ROLES_CRUD_STAFF),
    uploadDocument
);

// Get all documents
// Rule: View for All
router.get(
    '/', 
    authMiddleware,
    checkRole(ROLES_VIEW_ALL),
    getDocuments
);

// Download document by ID
// Rule: View for All
router.get(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_VIEW_ALL),
    downloadDocument
); 

// Delete document by ID
// Rule: CRUD for Staff
router.delete(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_CRUD_STAFF),
    deleteDocument
);

module.exports = router;