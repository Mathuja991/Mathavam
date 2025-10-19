const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  service: { type: String, required: true },
  beneficiaries: { type: Number, default: 0 },
  followUps: { type: Number, default: 0 },
  hours: { type: String, default: '' },
  comments: { type: String, default: '' }
});

const monthlyReturnSchema = new mongoose.Schema({
  period: { 
    type: String, 
    required: true,
    enum: ['January-June', 'July-December'] // Only allow these two values
  },
  year: { 
    type: String, 
    required: true,
    match: [/^\d{4}$/, 'Year must be 4 digits'] // Validate year format
  },
  entries: [entrySchema],
  signature: { 
    type: String, 
    required: true,
    trim: true
  }
}, { 
  timestamps: true 
});

// Add index for better query performance
monthlyReturnSchema.index({ period: 1, year: 1 });

module.exports = mongoose.model('MonthlyReturn', monthlyReturnSchema);