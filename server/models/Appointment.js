// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Link to the patient (child) being seen. 
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child', // Assuming your patient details are in a 'Child' model/collection
        required: true
    },
    
    // Link to the Doctor or Therapist conducting the appointment
    practitioner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model (specifically Doctors/Therapists)
        required: true
    },
    
    // Appointment details
    serviceType: {
        type: String,
        required: true, 
        enum: [
            'Speech Therapy', 
            'Occupational Therapy', 
            'Physiotherapy', 
            'Counseling Session', 
            'Other'
        ],
        default: 'General Consultation' 
    },
    
    appointmentDate: {
        type: Date,
        required: true
    },
    
    startTime: {
        type: String, // e.g., "09:00"
        required: true
    },
    
    endTime: {
        type: String, // e.g., "10:00"
        required: true
    },
    
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
        default: 'Pending'
    },
    
    notes: {
        type: String,
        required: false // Optional field
    },
    
    // --- THIS IS THE FIX ---
    // bookedBy is now OPTIONAL (required: true was removed)
    // The system will no longer require this to save.
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false // <-- This was changed from true
    },

}, { timestamps: true }); // Added timestamps for created/updated tracking

module.exports = mongoose.model('Appointment', appointmentSchema);