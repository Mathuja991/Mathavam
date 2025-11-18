const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  availabilitySlots: [slotSchema]  
});

module.exports = mongoose.model("Availability", availabilitySchema);
