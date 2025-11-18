require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');
const { Mistral } = require('@mistralai/mistralai');
const { v4: uuid } = require('uuid');
const { extractText } = require('./textExtractor');

const client = new MongoClient(process.env.MONGO_URI);
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const storePath = path.join(__dirname, 'vectorStore.json');

async function embedWithRetry(text, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await mistral.embeddings.create({ model: 'mistral-embed', inputs: [text] });
      return resp.data?.[0]?.embedding || [];
    } catch (err) {
      // Back off on 429, otherwise fail fast
      if (err.statusCode === 429 && i < attempts - 1) {
        const delay = 500 * (i + 1); // simple linear backoff
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  return [];
}

function chunkText(text, size = 800) {
  const words = text.split(/\s+/);
  const res = [];
  for (let i = 0; i < words.length; i += size) {
    res.push(words.slice(i, i + size).join(' '));
  }
  return res;
}

async function downloadToTemp(bucket, file) {
  const tmpPath = path.join(__dirname, `tmp_${file._id}`);
  await new Promise((resolve, reject) => {
    bucket
      .openDownloadStream(file._id)
      .pipe(fs.createWriteStream(tmpPath))
      .on('finish', resolve)
      .on('error', reject);
  });
  return tmpPath;
}

async function ingest() {
  await client.connect();
  const db = client.db('testWorkingMathavam');
  const bucket = new GridFSBucket(db, { bucketName: 'documents' });
  const files = await db.collection('documents.files').find({}).toArray();
  const chunks = [];

  for (const file of files) {
    const tmpPath = await downloadToTemp(bucket, file);
    const rawText = await extractText(tmpPath, file.filename || '');
    const text = typeof rawText === 'string' ? rawText : String(rawText ?? '');
    fs.unlinkSync(tmpPath);
    const parts = chunkText(text, 800);
    parts.forEach((p, idx) => {
      chunks.push({
        id: uuid(),
        fileId: file._id.toString(),
        filename: file.filename,
        chunkIndex: idx,
        text: p,
      });
    });
  }

  for (const c of chunks) {
    c.embedding = await embedWithRetry(c.text);
  }

  fs.writeFileSync(storePath, JSON.stringify({ chunks }, null, 2));
  console.log('Ingestion complete. Chunks:', chunks.length);
  await client.close();
}

ingest().catch(err => {
  console.error('Ingestion failed', err);
  process.exit(1);
});
