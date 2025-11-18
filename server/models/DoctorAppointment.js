// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  doctorName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  patientNote: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DoctorAppointment', appointmentSchema);