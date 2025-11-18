// routes/DoctorAppointment.js (Route definitions file)

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/doctorAppointmentController');
// const auth = require('../middleware/auth'); // If you have auth middleware

// 1. Book New Appointment (POST)
router.post('/book', appointmentController.bookAppointment);

// 2. Get All Appointments (GET) - Includes filtering
router.get('/', appointmentController.getAppointments);

// 3. Update Entire Appointment (PUT)
router.put('/:id', appointmentController.updateAppointment); 

// 4. Update Appointment Status (PUT /:id/status) - FIX: Controller function now exists
router.put('/:id/status', appointmentController.updateAppointmentStatus); 

// 5. Get Appointment by ID (GET)
router.get('/:id', appointmentController.getAppointmentById);

// 6. Cancel Appointment (PUT /:id/cancel)
router.put('/:id/cancel', appointmentController.cancelAppointment);

// 7. Get Appointments by Doctor and Date (GET)
// NOTE: Make sure this route is placed AFTER /:id and /:id/cancel routes to avoid conflicts
router.get('/:doctorName/:date', appointmentController.getAppointmentsByDoctorAndDate);


module.exports = router;