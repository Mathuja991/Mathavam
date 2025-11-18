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

router.get('/doctor/:doctorId', getDoctorAvailability);
router.post('/', setAvailability);
router.post('/add', addAvailabilitySlots);
router.put('/update', updateAvailabilitySlot); 
router.delete('/delete', deleteAvailabilitySlotBody); 
router.delete('/delete-all', clearDoctorAvailabilityBody);

router.put('/:slotId', updateAvailabilitySlot);
router.delete('/:slotId', deleteAvailabilitySlot);
router.delete('/doctor/:doctorId', clearDoctorAvailability);
router.post('/doctors', getMultipleDoctorsAvailability);
router.get('/doctors/all', getAllDoctorsFromAvailability);
module.exports = router;