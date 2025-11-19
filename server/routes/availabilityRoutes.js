// In your routes file (routes/availability.js)
const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.post('/doctors', availabilityController.getMultipleDoctorsAvailability);
router.get('/all/doctors', availabilityController.getAllDoctorsFromAvailability);
router.post('/add', availabilityController.addAvailabilitySlots);

router.delete('/delete-slot', availabilityController.deleteAvailabilitySlotBody);
router.delete('/delete-all', availabilityController.clearDoctorAvailabilityBody);
router.put('/update', availabilityController.updateAvailabilitySlotBody);

// PARAMETERIZED ROUTES LAST
router.get('/:doctorId', availabilityController.getDoctorAvailability);
router.delete('/:slotId', availabilityController.deleteAvailabilitySlot);
router.delete('/doctor/:doctorId', availabilityController.clearDoctorAvailability);
router.put('/:slotId', availabilityController.updateAvailabilitySlot);

// OTHER ROUTES
router.post('/', availabilityController.setAvailability);

module.exports = router;