
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const checkRole = require('../middleware/checkRoleMiddleware');
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

const ROLES_ADMIN = ['Super Admin', 'Admin'];
const ROLES_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];
const ROLES_ALL = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];

router.route('/')
  .get(authMiddleware, checkRole(ROLES_ADMIN), getAllAppointments) 
  .post(authMiddleware, checkRole(ROLES_ALL), createAppointment);

router.route('/:id')
  .get(authMiddleware, checkRole(ROLES_ALL), getAppointmentById)    
  .put(authMiddleware, checkRole(ROLES_ALL), updateAppointment)     
  .delete(authMiddleware, checkRole(ROLES_ALL), deleteAppointment); 

router.route('/:id/status')
  .put(authMiddleware, checkRole(ROLES_STAFF), updateAppointmentStatus); 

router.route('/practitioner/:id')
  .get(authMiddleware, checkRole(ROLES_STAFF), getPractitionerAppointments); 

router.route('/patient/:id')
  .get(authMiddleware, checkRole(ROLES_ALL), getPatientAppointments); 

module.exports = router;