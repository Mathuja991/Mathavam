// controllers/documentController.js
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });

const uploadDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { title } = req.body;
    const file = req.files.file;

    await client.connect();
    const db = client.db('testWorkingMathavam');
    const bucket = new GridFSBucket(db, { bucketName: 'documents' });

    const uploadStream = bucket.openUploadStream(file.name);
    uploadStream.end(file.data);

    uploadStream.on('finish', async () => {
      // uploadStream.id is the GridFS file id (ObjectId)
      const gridFsId = uploadStream.id;

      // Store metadata including gridFsId
      const newDoc = new Document({
        title,
        filename: file.name,
        filepath: `/api/documents/${gridFsId}`, // download URL
        gridFsId: gridFsId.toString(), // store as string for easy use
      });

      await newDoc.save();
      res.status(200).json({
        message: 'File uploaded successfully!',
        fileId: gridFsId,
        document: newDoc,
      });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ error: err.message });
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(500).send('Server error');
  }
};


const getDocuments = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('testWorkingMathavam');
    const bucket = new GridFSBucket(db, { bucketName: 'documents' });

    // List all files in GridFS
    const files = await db.collection('documents.files').find({}).toArray();

    res.status(200).json(files); // return an array of documents
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single document by id (download)
const downloadDocument = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('testWorkingMathavam');
    const bucket = new GridFSBucket(db, { bucketName: 'documents' });

    const fileId = new ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
      res.status(404).send('File not found');
    });

    res.set('Content-Disposition', 'inline'); // or 'attachment' to force download
    downloadStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    await client.connect();
    const db = client.db('testWorkingMathavam');
    const bucket = new GridFSBucket(db, { bucketName: 'documents' });

    // First, check if file exists in GridFS
    const fileExists = await db.collection('documents.files').findOne({ _id: new ObjectId(fileId) });
    if (!fileExists) {
      return res.status(404).json({ error: 'File not found in GridFS' });
    }

    // Delete from GridFS
    await bucket.delete(new ObjectId(fileId));

    // Also delete from Document model if it exists
    try {
      await Document.deleteOne({ gridFsId: fileId });
    } catch (dbError) {
      console.log('No corresponding document found in Document model, continuing...');
    }

    res.json({ message: 'File deleted successfully!' });
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    if (error.message.includes('FileNotFound')) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
module.exports = { uploadDocument, getDocuments, downloadDocument, deleteDocument};
