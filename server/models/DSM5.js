const mongoose = require('mongoose');

const DSM5FormSchema = new mongoose.Schema({
  patientInfo: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    hasPreviousDsm4Diagnosis: { type: Boolean, default: false },
  },
  answers: {
    socialCommunication: { type: [String], required: true }, 
    repetitiveBehaviors: { type: [String], required: true }, 
    otherCriteria: { type: [String], required: true },     
  },
  severityRatings: {
    socialCommunication: { type: String, required: true },
    repetitiveBehaviors: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DSM5Form', DSM5FormSchema);