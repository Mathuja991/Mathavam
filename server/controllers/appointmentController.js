// server/controllers/appointmentController.js

const Appointment = require('../models/Appointment');
const User = require('../models/User'); 
const Child = require('../models/Child'); 

// @desc    Create new appointment 
// @route   POST /api/appointments
// @access  NOW PUBLIC (No longer private)
exports.createAppointment = async (req, res) => {
    
    // We try to get the bookerId, but we don't fail if it's not there.
    const bookerId = req.user ? (req.user.id || req.user._id) : null;

    const { 
        patient, 
        practitioner, 
        serviceType, 
        appointmentDate, 
        startTime, 
        endTime,
        notes 
    } = req.body;

    // Validation (this still runs)
    if (!patient || !practitioner || !appointmentDate || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Please provide all required appointment details.' });
    }

    // The "if (!bookerId)" block that sent the 401 error has been REMOVED.

    try {
        const newAppointment = new Appointment({
            patient,
            practitioner,
            serviceType,
            appointmentDate,
            startTime,
            endTime,
            notes,
            bookedBy: bookerId, 
            status: 'Pending' 
        });

        const appointment = await newAppointment.save();
        
        // --- THIS IS THE FIX (Part 1) ---
        // We populate with the CORRECT fields: 'name' and 'childNo'/'childRegNo'
        await appointment.populate('patient', 'name childNo childRegNo');
        await appointment.populate('practitioner', 'firstName lastName userType');
        
        if (appointment.bookedBy) {
            await appointment.populate('bookedBy', 'username userType');
        }

        res.status(201).json({ 
            success: true, 
            data: appointment,
            message: 'Appointment booked successfully!'
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error: Could not create appointment.' });
    }
};

// ... (rest of the controller functions remain unchanged) ...

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            // --- THIS IS THE FIX (Part 2) ---
            .populate('patient', 'name childNo childRegNo') // Changed from firstName, lastName
            .populate('practitioner', 'firstName lastName userType') 
            .populate('bookedBy', 'username userType') 
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAppointmentById = async (req, res) => { 
    try {
        const appointment = await Appointment.findById(req.params.id)
            // --- THIS IS THE FIX (Part 3) ---
            .populate('patient', 'name childNo childRegNo') // Changed from firstName, lastName
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType');
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateAppointment = async (req, res) => { 
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
          // --- THIS IS THE FIX (Part 4) ---
          .populate('patient', 'name childNo childRegNo') // Changed from firstName, lastName
          .populate('practitioner', 'firstName lastName userType')
          .populate('bookedBy', 'username userType');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteAppointment = async (req, res) => { 
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Please provide a status to update.' });
        }

        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getPractitionerAppointments = async (req, res) => {
    try {
        const practitionerId = req.params.id;
        const appointments = await Appointment.find({ practitioner: practitionerId })
            // --- THIS IS THE FIX (Part 5) ---
            .populate('patient', 'name childNo childRegNo') // Changed from firstName, lastName
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType')
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching practitioner appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await Child.findById(patientId);

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient (child) not found.' });
        }

        const appointments = await Appointment.find({ patient: patientId })
            // --- THIS IS THE FIX (Part 6) ---
            .populate('patient', 'name childNo childRegNo') // Changed from firstName, lastName
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType')
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};