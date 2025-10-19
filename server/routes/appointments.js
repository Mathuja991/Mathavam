// server/routes/appointments.js

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getPractitionerAppointments, 
  getPatientAppointments      
} = require('../controllers/appointmentController'); 

const router = express.Router();

// Base /api/appointments routes
router.route('/')
  .get(authMiddleware, getAllAppointments) // GET: Protected
  // --- THIS IS THE FIX ---
  // authMiddleware was removed from the .post route.
  // Anyone can now create an appointment.
  .post(createAppointment); // POST: NOW PUBLIC

// Routes for specific appointment by ID (Still protected)
router.route('/:id')
  .get(authMiddleware, getAppointmentById)    
  .put(authMiddleware, updateAppointment)     
  .delete(authMiddleware, deleteAppointment); 

// Route for updating appointment status (Still protected)
router.route('/:id/status')
  .put(authMiddleware, updateAppointmentStatus); 

// Routes for fetching appointments (Still protected)
router.route('/practitioner/:id')
  .get(authMiddleware, getPractitionerAppointments); 

router.route('/patient/:id')
  .get(authMiddleware, getPatientAppointments); 

module.exports = router;