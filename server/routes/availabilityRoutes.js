const express = require('express');
const router = express.Router();
const {
  getDoctorAvailability,
  setAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  clearDoctorAvailability,
  updateAvailabilitySlot,
  getMultipleDoctorsAvailability
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

// @route   PUT /api/availability/:slotId
// @desc    Update a specific availability slot
// @access  Private
router.put('/:slotId', updateAvailabilitySlot);

// @route   DELETE /api/availability/:slotId
// @desc    Delete a specific availability slot
// @access  Private
router.delete('/:slotId', deleteAvailabilitySlot);

// @route   DELETE /api/availability/doctor/:doctorId
// @desc    Delete all availability for a doctor
// @access  Private
router.delete('/doctor/:doctorId', clearDoctorAvailability);

// @route   POST /api/availability/doctors
// @desc    Get availability for multiple doctors
// @access  Private
router.post('/doctors', getMultipleDoctorsAvailability);

module.exports = router;