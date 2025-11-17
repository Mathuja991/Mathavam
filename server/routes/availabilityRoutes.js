const express = require('express');
const router = express.Router();
const {
  getDoctorAvailability,
  setAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  clearDoctorAvailability,
  updateAvailabilitySlot,
  getMultipleDoctorsAvailability,
  getAllDoctorsFromAvailability,
  deleteAvailabilitySlotBody,
  clearDoctorAvailabilityBody
} = require('../controllers/availabilityController');

// @route   GET /api/availability/doctor/:doctorId
// @desc    Get all availability slots for a doctor
// @access  Private
router.get('/doctor/:doctorId', getDoctorAvailability);

// @route   POST /api/availability
// @desc    Create or update availability slots
// @access  Private
router.post('/', setAvailability);

// @route   POST /api/availability/add
// @desc    Add new availability slots without deleting existing ones
// @access  Private
router.post('/add', addAvailabilitySlots);

// ⭐️ ADD THESE MISSING ROUTES THAT YOUR FRONTEND NEEDS:

// @route   PUT /api/availability/update
// @desc    Update a specific availability slot (frontend expects this)
// @access  Private
router.put('/update', updateAvailabilitySlot); // ADD THIS

// @route   DELETE /api/availability/delete
// @desc    Delete a specific availability slot (frontend expects this)
// @access  Private
router.delete('/delete', deleteAvailabilitySlotBody); // ADD THIS

// @route   DELETE /api/availability/delete-all
// @desc    Delete all availability for a doctor (frontend expects this)
// @access  Private
router.delete('/delete-all', clearDoctorAvailabilityBody); // ADD THIS

// Existing routes (keep these too)
router.put('/:slotId', updateAvailabilitySlot);
router.delete('/:slotId', deleteAvailabilitySlot);
router.delete('/doctor/:doctorId', clearDoctorAvailability);
router.post('/doctors', getMultipleDoctorsAvailability);
// Add this route
router.get('/doctors/all', getAllDoctorsFromAvailability);
module.exports = router;