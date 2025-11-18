const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // doctorId now represents the generic Staff ID
  doctorId: {
    type: String,
    required: [true, 'Staff ID (Doctor ID) is required'],
    trim: true,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  // New general staff fields
  role: {
    type: String,
    required: [true, 'Role/Designation is required'],
    trim: true
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of Joining is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  // Original Doctor fields, now used for general staff contact
  doctorEmail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  doctorPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [60, 'Experience cannot be more than 60 years']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);