const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: String,
  filepath: String
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
