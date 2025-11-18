const express = require('express');
const router = express.Router();
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
  // checkStaffId is removed as it's no longer needed
} = require('../controllers/doctorController');


// CRUD routes for Staff members (using the /api/doctors path)
router.post('/', createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;