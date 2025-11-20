// server/controllers/appointmentController.js

const mongoose = require('mongoose'); // mongoose import කිරීම (getPatientAppointments සඳහා)
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Child = require('../models/Child');
const Notification = require('../models/Notification'); // Notification model

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  const bookerId = req.user ? req.user.id || req.user._id : null;
  const { patient, practitioner, serviceType, appointmentDate, startTime, endTime, notes } = req.body;

  if (!patient || !practitioner || !serviceType || !appointmentDate || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide patient, practitioner, service type, date, start time, and end time.',
    });
  }

  try {
    const newAppointment = new Appointment({
      patient, practitioner, serviceType, appointmentDate, startTime, endTime, notes,
      bookedBy: bookerId, status: 'Pending',
    });
    const appointment = await newAppointment.save();

    // --- Create Notification on Booking ---
    try {
      const child = await Child.findById(patient);
      if (child) {
        const registrationNumber = (child.childNo || child.childRegNo || '').trim();
        const patientName = child.name;
        if (registrationNumber && patientName) {
          let bookerName = 'Mathavam System';
          if (bookerId) {
            const adminUser = await User.findById(bookerId);
            bookerName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'an Admin';
          }
          const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const message = `A new appointment for ${patientName} (${registrationNumber}) has been booked by ${bookerName} on ${formattedDate} at ${appointment.startTime}.`;
          const notification = new Notification({
            patientName: patientName, patientRegNo: registrationNumber, message: message, link: '/dashboard/appointments',
          });
          await notification.save();
          console.log(`Notification created for RegNo: ${registrationNumber} (New Booking)`);
        } else {
          console.warn('Could not create notification: missing registrationNumber or patientName');
        }
      } else {
        console.warn('Could not create notification: Child not found for patient ID:', patient);
      }
    } catch (notificationError) {
      console.error('Failed to create notification on booking:', notificationError.message);
    }
    // --- Notification Logic Ends ---

    await appointment.populate('patient', 'name childNo childRegNo');
    await appointment.populate('practitioner', 'firstName lastName userType');
    if (appointment.bookedBy) { await appointment.populate('bookedBy', 'username userType'); }

    res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully!' });
  } catch (error) { /* Error handling... */
     console.error('Error creating appointment:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error: Could not create appointment.'});
  }
};


exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Find and update the appointment
    // Populate patient details *before* saving notification
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true, runValidators: true }
    ).populate('patient', 'name childNo childRegNo'); // <-- Populate Patient

    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // --- Create Notification on Status Change ---
    try {
      // Get child details from the populated appointment
      const child = updatedAppointment.patient;

      if (child) {
        const registrationNumber = (child.childNo || child.childRegNo || '').trim();
        const patientName = child.name;

        // Create notification only if RegNo exists
        if (registrationNumber && patientName) {
          const formattedDate = new Date(updatedAppointment.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          
          // Create a meaningful message based on the new status
          let message = `The status of the appointment for ${patientName} (${registrationNumber}) on ${formattedDate} at ${updatedAppointment.startTime} has been updated to ${status}.`;
          


          const notification = new Notification({
            patientName: patientName,
            patientRegNo: registrationNumber,
            message: message,
            link: '/dashboard/appointments', // Link remains the same
          });
          await notification.save();
          console.log(`Notification created for RegNo: ${registrationNumber} (Status Update: ${status})`);

        } else {
           console.warn(`Could not send status update notification: Child associated with appointment ${appointmentId} is missing 'childNo' or 'childRegNo'.`);
        }
      } else {
        console.warn(`Could not send status update notification: Child details not found for appointment ${appointmentId}.`);
      }
    } catch (notificationError) {
      // Log error but allow the main response to succeed
      console.error(`Failed to create notification for status update (Appointment ID: ${appointmentId}):`, notificationError.message);
    }
    // --- Notification Logic Ends ---

    // Populate practitioner for the response (Patient is already populated)
    await updatedAppointment.populate('practitioner', 'firstName lastName userType');

    res.status(200).json({ success: true, data: updatedAppointment, message: `Appointment status updated to ${status}.` });

  } catch (error) {
    console.error('Error updating appointment status:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};



exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name childNo childRegNo')
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
      .populate('patient', 'name childNo childRegNo')
      .populate('practitioner', 'firstName lastName userType')
      .populate('bookedBy', 'username userType');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) { /* Error handling... */
     console.error('Error fetching appointment by ID:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
   }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient', 'name childNo childRegNo')
      .populate('practitioner', 'firstName lastName userType')
      .populate('bookedBy', 'username userType');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.status(200).json({ success: true, data: appointment, message: 'Appointment updated successfully.' });
  } catch (error) { /* Error handling... */
    console.error('Error updating appointment:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Appointment ID format.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Appointment deleted successfully.' });
  } catch (error) { /* Error handling... */
    console.error('Error deleting appointment:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getPractitionerAppointments = async (req, res) => {
    try {
        const practitionerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(practitionerId)) {
            return res.status(400).json({ success: false, message: 'Invalid Practitioner ID format.' });
        }
        const appointments = await Appointment.find({ practitioner: practitionerId })
            .populate('patient', 'name childNo childRegNo')
            .populate('bookedBy', 'username userType')
            .sort({ appointmentDate: 1, startTime: 1 });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) { /* Error handling... */
        console.error('Error fetching practitioner appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ success: false, message: 'Invalid Patient ID format.' });
        }
        const patientExists = await Child.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({ success: false, message: 'Patient (child) not found.' });
        }
        const appointments = await Appointment.find({ patient: patientId })
            .populate('practitioner', 'firstName lastName userType')
            .populate('bookedBy', 'username userType')
            .sort({ appointmentDate: 1, startTime: 1 });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) { /* Error handling... */
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};