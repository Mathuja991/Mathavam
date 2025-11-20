const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'],
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  childRegNo: {
    type: String,
    required: function() {
      return this.userType === 'Parent';
    },
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;