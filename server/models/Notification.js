// models/Notification.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  // --- USER FIELD එක මෙතන නොතිබිය යුතුයි ---
  
  patientName: {
    type: String,
    required: true
  },
  patientRegNo: {
    type: String,
    required: true,
    index: true 
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '/dashboard/appointments'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);