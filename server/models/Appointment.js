const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
    
    practitioner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
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
        type: String,
        required: true
    },
    
    endTime: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
        default: 'Pending'
    },
    
    notes: {
        type: String,
        required: false
    },
    
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false
    },

}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);