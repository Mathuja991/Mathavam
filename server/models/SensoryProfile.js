const mongoose = require("mongoose");


const eachSensoryProfileQuestion = new mongoose.Schema({
  qid: {
    type: Number,
    required: true,
  },
  quadrant: {
    type: String,
    trim: true,
    default: ""
  },
  score: {
    type: Number,
    required: true,
  },
});


const sensoryProfileAssessment = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    examinerId: {
      type: String,
      required: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    assessmentType: {
      type: String,
      required: true,
    },
    ageGroup: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    responses: [eachSensoryProfileQuestion],
    rawScore: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

sensoryProfileAssessment.index({ patientId: 1, testDate: 1, category: 1 },{unique:true});
module.exports = mongoose.model("SensoryProfile", sensoryProfileAssessment);
