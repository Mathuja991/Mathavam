// models/MonthlyReturn.js
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  service: { type: String, required: true },
  beneficiaries: { type: Number, default: 0 },
  followUps: { type: Number, default: 0 },
  hours: { type: String, default: '' },
  comments: { type: String, default: '' }
});

const monthlyReturnSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: String, required: true },
  entries: [entrySchema],
  signature: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MonthlyReturn', monthlyReturnSchema);
