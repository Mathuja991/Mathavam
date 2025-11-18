const Availability = require('../models/Availability');

// Get all availability slots for a doctor
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const availability = await Availability.find({ doctorId })
      .sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      data: availability,
      message: 'Availability fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability',
      error: error.message
    });
  }
};

// Create or update availability slots
const setAvailability = async (req, res) => {
  try {
    const { doctorId, doctorName, availabilitySlots } = req.body;

    if (!doctorId || !doctorName || !availabilitySlots || !Array.isArray(availabilitySlots)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, doctor name, and availability slots are required'
      });
    }

    for (const slot of availabilitySlots) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Each slot must have day, startTime, and endTime'
        });
      }
      
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time for all slots'
        });
      }
    }

    const slotsToCreate = availabilitySlots.map(slot => ({
      doctorId,
      doctorName,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));

    const createdSlots = await Availability.insertMany(slotsToCreate);

    res.status(201).json({
      success: true,
      data: createdSlots,
      message: 'Availability saved successfully'
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting availability',
      error: error.message
    });
  }
};

// Add new availability slots (without deleting existing ones)
const addAvailabilitySlots = async (req, res) => {
  try {
    const { doctorId, doctorName, availabilitySlots } = req.body;

    let availability = await Availability.findOne({ doctorId });

    if (!availability) {
      availability = new Availability({
        doctorId,
        doctorName,
        availabilitySlots
      });
    } else {
      availability.availabilitySlots.push(...availabilitySlots);
    }

    await availability.save();

    res.status(201).json({
      success: true,
      data: availability,
      message: "Slots added successfully"
    });

  } catch (error) {
    console.error("Error adding slots:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a specific availability slot (using URL params) - FOR SINGLE DOCUMENTS
const deleteAvailabilitySlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const deletedSlot = await Availability.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability slot deleted successfully',
      data: deletedSlot
    });
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting availability slot',
      error: error.message
    });
  }
};

// Delete a specific availability slot (using request body) - FOR NESTED SLOTS
// Delete a specific availability slot (using request body) - FOR NESTED SLOTS
const deleteAvailabilitySlotBody = async (req, res) => {
  try {
    const { slotId } = req.body;
    console.log('Deleting nested slot with ID:', slotId);

    // Find the availability document that contains this slot
    const availability = await Availability.findOne({ "availabilitySlots._id": slotId });
    
    if (!availability) {
      return res.status(404).json({ 
        success: false, 
        message: "Slot not found" 
      });
    }

    console.log('Found availability document:', availability._id);

    // Use $pull to remove the slot from the array (MORE RELIABLE METHOD)
    const result = await Availability.updateOne(
      { _id: availability._id },
      { $pull: { availabilitySlots: { _id: slotId } } }
    );

    console.log('Delete result:', result);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Slot not found in availability document" 
      });
    }

    res.json({
      success: true,
      message: "Slot deleted successfully",
      data: { slotId }
    });
  } catch (error) {
    console.error("Error deleting nested slot:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete all availability for a doctor (using URL params)
const clearDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const result = await Availability.deleteMany({ doctorId });

    res.json({
      success: true,
      message: `Cleared all availability slots for doctor`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing availability',
      error: error.message
    });
  }
};

// Clear all availability using request body
const clearDoctorAvailabilityBody = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    const result = await Availability.deleteMany({ doctorId });

    res.json({
      success: true,
      message: `Cleared all availability slots for doctor`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing availability',
      error: error.message
    });
  }
};

// Update a specific availability slot (using URL params) - FOR SINGLE DOCUMENTS
const updateAvailabilitySlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const updatedSlot = await Availability.findByIdAndUpdate(
      slotId,
      { startTime, endTime },
      { new: true, runValidators: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    res.json({
      success: true,
      data: updatedSlot,
      message: 'Availability slot updated successfully'
    });
  } catch (error) {
    console.error('Error updating availability slot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability slot',
      error: error.message
    });
  }
};

// Update slot using request body - FOR NESTED SLOTS
const updateAvailabilitySlotBody = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;
    console.log('Updating nested slot with ID:', slotId);

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const availability = await Availability.findOne({ "availabilitySlots._id": slotId });
    if (!availability) {
      return res.status(404).json({ 
        success: false, 
        message: "Slot not found" 
      });
    }

    const slot = availability.availabilitySlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: "Slot not found in availability document" 
      });
    }

    slot.startTime = startTime;
    slot.endTime = endTime;

    await availability.save();

    res.json({
      success: true,
      data: slot,
      message: "Slot updated successfully"
    });
  } catch (error) {
    console.error("Error updating nested slot:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getAllDoctorsFromAvailability = async (req, res) => {
  try {
    const allAvailability = await Availability.find({}, "doctorId doctorName");

    const unique = new Map();

    allAvailability.forEach(doc => {
      if (doc.doctorId && !unique.has(doc.doctorId)) {
        unique.set(doc.doctorId, {
          _id: doc.doctorId,
          name: doc.doctorName
        });
      }
    });

    res.json({
      success: true,
      data: Array.from(unique.values()),
      message: "Doctors fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors",
      error: error.message
    });
  }
};

const getMultipleDoctorsAvailability = async (req, res) => {
  try {
    const { doctorIds } = req.body;

    if (!doctorIds || !Array.isArray(doctorIds)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor IDs array is required'
      });
    }

    const availabilityDocs = await Availability.find({
      doctorId: { $in: doctorIds }
    }).sort({ doctorId: 1 });

    const availabilityData = availabilityDocs.map(doc => ({
      doctorId: doc.doctorId,
      doctorName: doc.doctorName,
      availabilitySlots: doc.availabilitySlots
    }));

    res.json({
      success: true,
      data: availabilityData,
      message: 'Multiple doctors availability fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching multiple doctors availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability',
      error: error.message
    });
  }
};

module.exports = {
  getDoctorAvailability,
  setAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  deleteAvailabilitySlotBody,
  clearDoctorAvailability,
  clearDoctorAvailabilityBody,
  updateAvailabilitySlot,
  updateAvailabilitySlotBody,
  getMultipleDoctorsAvailability,
  getAllDoctorsFromAvailability
};