// server/controllers/appointmentController.js (updated)

const Appointment = require('../models/Appointment');
const User = require('../models/User'); 
const Child = require('../models/Child'); // Now this import will be valid

// @desc    Get all appointments (Admin/Super Admin only)
// @route   GET /api/appointments
// @access  Private (Admin/Super Admin)
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'childRegNo firstName lastName') 
            .populate('practitioner', 'firstName lastName userType') 
            .populate('bookedBy', 'username userType') 
            .sort({ appointmentDate: 1, startTime: 1 });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'childRegNo firstName lastName')
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType');

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Accessible by Parent, Admin, Resource Person)
exports.createAppointment = async (req, res) => {
    const { patientId, practitionerId, serviceType, appointmentDate, startTime, endTime, notes } = req.body;
    
    // TEMPORARY FIX: Hardcode a user ID for testing since authentication is not yet implemented.
    // REPLACE THIS WITH req.user.id ONCE AUTHENTICATION IS IN PLACE.
    const bookedBy = '686933fb47094ce160d5b128'; 

    // Basic validation
    if (!patientId || !practitionerId || !appointmentDate || !startTime || !endTime || !bookedBy) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields: patient, practitioner, date, start time, end time.' });
    }

    try {
        // Validate practitioner exists and is a Doctor or Therapist
        const practitioner = await User.findById(practitionerId);
        if (!practitioner || (!['Doctor', 'Therapist'].includes(practitioner.userType))) {
            return res.status(400).json({ success: false, message: 'Invalid practitioner selected.' });
        }

        // Validate patient (child) exists - This is where the error occurred
        const patient = await Child.findById(patientId);
        if (!patient) {
            return res.status(400).json({ success: false, message: 'Invalid patient selected.' });
        }

        // Conditional requirement for serviceType if practitioner is a Therapist
        if (practitioner.userType === 'Therapist' && !serviceType) {
            return res.status(400).json({ success: false, message: 'Service Type is required for Therapist appointments.' });
        }

        const newAppointment = new Appointment({
            patient: patientId,
            practitioner: practitionerId,
            serviceType: serviceType || null, 
            appointmentDate,
            startTime,
            endTime,
            notes,
            bookedBy,
            status: 'Pending'
        });

        await newAppointment.save();
        res.status(201).json({ success: true, data: newAppointment, message: 'Appointment created successfully!' });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update appointment details
// @route   PUT /api/appointments/:id
// @access  Private (Admin/Practitioner)
exports.updateAppointment = async (req, res) => {
    try {
        const { patientId, practitionerId, serviceType, appointmentDate, startTime, endTime, notes, status } = req.body;
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        appointment.patient = patientId || appointment.patient;
        appointment.practitioner = practitionerId || appointment.practitioner;
        appointment.serviceType = serviceType !== undefined ? serviceType : appointment.serviceType;
        appointment.appointmentDate = appointmentDate || appointment.appointmentDate;
        appointment.startTime = startTime || appointment.startTime;
        appointment.endTime = endTime || appointment.endTime;
        appointment.notes = notes !== undefined ? notes : appointment.notes;
        appointment.status = status || appointment.status;

        await appointment.save();
        res.status(200).json({ success: true, data: appointment, message: 'Appointment updated successfully!' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin/Practitioner - with proper authorization)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        await appointment.deleteOne();
        res.status(200).json({ success: true, data: {}, message: 'Appointment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update appointment status (e.g., Confirmed, Cancelled, Completed)
// @route   PUT /api/appointments/:id/status
// @access  Private (Practitioner/Admin)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required.' });
        }

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        if (!['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }

        appointment.status = status;
        await appointment.save();
        res.status(200).json({ success: true, data: appointment, message: `Appointment status updated to ${status}!` });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get appointments for a specific practitioner (Doctor or Therapist)
// @route   GET /api/appointments/practitioner/:id
// @access  Private (Practitioner themselves or Admin/Super Admin)
exports.getPractitionerAppointments = async (req, res) => {
    try {
        const practitionerId = req.params.id;
        const practitioner = await User.findById(practitionerId);

        if (!practitioner || (!['Doctor', 'Therapist'].includes(practitioner.userType))) {
            return res.status(404).json({ success: false, message: 'Practitioner not found or not a Doctor/Therapist.' });
        }

        const appointments = await Appointment.find({ practitioner: practitionerId })
            .populate('patient', 'childRegNo firstName lastName')
            .populate('practitioner', 'firstName lastName userType')
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching practitioner appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get appointments for a specific patient (child)
// @route   GET /api/appointments/patient/:id
// @access  Private (Parent who owns the child, Admin/Super Admin, or Practitioner involved)
exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await Child.findById(patientId);

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient (child) not found.' });
        }

        const appointments = await Appointment.find({ patient: patientId })
            .populate('patient', 'childRegNo firstName lastName')
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType')
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};