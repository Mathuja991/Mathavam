const mongoose = require("mongoose");

const SnapFormSchema = new mongoose.Schema({
  studentInfo: {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
  },
  answers: {
    type: Map,
    of: Number,
    required: true
  },
  totalScore: {
    type: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("SnapForm", SnapFormSchema);