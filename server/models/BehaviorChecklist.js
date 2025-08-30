const mongoose = require('mongoose');

const behaviorChecklistSchema = new mongoose.Schema(
  {
    childNo: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String },
    gender: { type: String },
    date: { type: String },
    social: [String],
    restrictive: [String],
    mood: [String],
    selfRegulation: [String],
    challenging: [String],
    selfInjury: [String], // accepts arrays
    scores: { type: Object },
    severity: { type: String },
  },
  { timestamps: true }
);

const BehaviorChecklist = mongoose.model('BehaviorChecklist', behaviorChecklistSchema);

module.exports = BehaviorChecklist;
