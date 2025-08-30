const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, downloadDocument} = require('../controllers/documentController');

// Upload document
router.post('/upload', uploadDocument);

// Get all documents
router.get('/', getDocuments);

router.get('/:id', downloadDocument); // download by ID

module.exports = router;
