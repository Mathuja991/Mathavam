const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/doctorAppointmentController');

router.post('/book', appointmentController.bookAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.get('/:doctorName/:date', appointmentController.getAppointmentsByDoctorAndDate);

module.exports = router;