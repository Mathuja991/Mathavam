// server/routes/appointments.js

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const checkRole = require('../middleware/checkRoleMiddleware'); // <-- ALUTH IMPORT
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

// --- Role Arrays ---
const ROLES_ADMIN = ['Super Admin', 'Admin'];
const ROLES_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];
const ROLES_ALL = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];

// Base /api/appointments routes
router.route('/')
  // Rule: Get All -> Admin/Super Admin witharai
  .get(authMiddleware, checkRole(ROLES_ADMIN), getAllAppointments) 
  // Rule: Create -> Okkoma logged in users lata puluwan (Doctor, Therapist, Parent, Admin...)
  .post(authMiddleware, checkRole(ROLES_ALL), createAppointment); // <-- MEKA PROTECT KALA

// Routes for specific appointment by ID
router.route('/:id')
  // Rule: Get/Update/Delete -> Okkoma roles walata denawa, eth controller eken check karanna one eya eyage appointment ekakda kiyala.
  .get(authMiddleware, checkRole(ROLES_ALL), getAppointmentById)    
  .put(authMiddleware, checkRole(ROLES_ALL), updateAppointment)     
  .delete(authMiddleware, checkRole(ROLES_ALL), deleteAppointment); 

// Route for updating appointment status
router.route('/:id/status')
  // Rule: Status eka wenas karanne staff eka witharai
  .put(authMiddleware, checkRole(ROLES_STAFF), updateAppointmentStatus); 

// Routes for fetching appointments
router.route('/practitioner/:id')
  // Rule: Practitioner (Doctor/Therapist) ge data balanne staff eka witharai
  .get(authMiddleware, checkRole(ROLES_STAFF), getPractitionerAppointments); 

router.route('/patient/:id')
  // Rule: Patientge data okkoma roles walata balanna puluwan (Parent ta eyage childge data balanna)
  .get(authMiddleware, checkRole(ROLES_ALL), getPatientAppointments); 

module.exports = router;