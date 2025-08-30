const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dates: { type: [String], default: [] }, // Dates as ISO strings
});

const MFlowchartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  childNo: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  date: { type: String, required: true },
  sections: [sectionSchema], // Dynamic section-based structure
}, {
  timestamps: true,
});

module.exports = mongoose.model('MFlowchart', MFlowchartSchema);
