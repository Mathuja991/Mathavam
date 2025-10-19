const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, downloadDocument, deleteDocument} = require('../controllers/documentController');

// Upload document
router.post('/upload', uploadDocument);

// Get all documents
router.get('/', getDocuments);

router.get('/:id', downloadDocument); // download by ID
router.delete('/:id', deleteDocument);
module.exports = router;
