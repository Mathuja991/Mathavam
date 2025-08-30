const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);

const uploadDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send('No file uploaded.');
    }

    const file = req.files.file;
    await client.connect();
    const db = client.db('testWorkingMathavam');
    const bucket = new GridFSBucket(db, { bucketName: 'documents' });

    const uploadStream = bucket.openUploadStream(file.name);
    uploadStream.end(file.data);

    uploadStream.on('finish', () => {
      res.status(200).json({ message: 'File uploaded successfully!', fileId: uploadStream.id });
    });

    uploadStream.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

  } catch (error) {
    console.error(error);
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
module.exports = { uploadDocument, getDocuments, downloadDocument };
