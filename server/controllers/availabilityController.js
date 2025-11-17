const Availability = require('../models/Availability');

// @desc    Get all availability slots for a doctor
// @route   GET /api/availability/doctor/:doctorId
// @access  Private
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

// @desc    Create or update availability slots
// @route   POST /api/availability
// @access  Private
const setAvailability = async (req, res) => {
  try {
    const { doctorId, doctorName, availabilitySlots } = req.body;

    // Validate required fields
    if (!doctorId || !doctorName || !availabilitySlots || !Array.isArray(availabilitySlots)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, doctor name, and availability slots are required'
      });
    }

    // Validate each slot
    for (const slot of availabilitySlots) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Each slot must have day, startTime, and endTime'
        });
      }
      
      // Validate time format and logic
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time for all slots'
        });
      }
    }

    // NEW APPROACH: Use bulk write operations to handle updates and inserts
    const bulkOperations = availabilitySlots.map(slot => ({
      updateOne: {
        filter: {
          doctorId: doctorId,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        },
        update: {
          $set: {
            doctorId: doctorId,
            doctorName: doctorName,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          }
        },
        upsert: true // This will create if doesn't exist, update if it does
      }
    }));

    // Execute bulk operations
    const result = await Availability.bulkWrite(bulkOperations);

    // Fetch the updated availability to return
    const updatedAvailability = await Availability.find({ doctorId })
      .sort({ day: 1, startTime: 1 });

    res.status(201).json({
      success: true,
      data: updatedAvailability,
      message: 'Availability saved successfully',
      result: result
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

// @desc    Add new availability slots (without deleting existing ones)
// @route   POST /api/availability/add
// @access  Private
const addAvailabilitySlots = async (req, res) => {
  try {
    const { doctorId, doctorName, availabilitySlots } = req.body;

    // Validate required fields
    if (!doctorId || !doctorName || !availabilitySlots || !Array.isArray(availabilitySlots)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, doctor name, and availability slots are required'
      });
    }

    // Validate each slot
    for (const slot of availabilitySlots) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Each slot must have day, startTime, and endTime'
        });
      }
      
      // Validate time format and logic
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time for all slots'
        });
      }

      // Check if slot already exists
      const existingSlot = await Availability.findOne({
        doctorId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      if (existingSlot) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${slot.startTime}-${slot.endTime} on ${slot.day} already exists`
        });
      }
    }

    // Create new availability slots
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
      message: 'New availability slots added successfully'
    });
  } catch (error) {
    console.error('Error adding availability slots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding availability slots',
      error: error.message
    });
  }
};

// @desc    Delete a specific availability slot
// @route   DELETE /api/availability/:slotId
// @access  Private
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

// @desc    Delete all availability for a doctor
// @route   DELETE /api/availability/doctor/:doctorId
// @access  Private
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

// @desc    Update a specific availability slot
// @route   PUT /api/availability/:slotId
// @access  Private
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

    // Validate time logic
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

// @desc    Get availability for multiple doctors
// @route   POST /api/availability/doctors
// @access  Private
const getMultipleDoctorsAvailability = async (req, res) => {
  try {
    const { doctorIds } = req.body;

    if (!doctorIds || !Array.isArray(doctorIds)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor IDs array is required'
      });
    }

    const availability = await Availability.find({ 
      doctorId: { $in: doctorIds } 
    }).sort({ doctorId: 1, day: 1, startTime: 1 });

    res.json({
      success: true,
      data: availability,
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
  clearDoctorAvailability,
  updateAvailabilitySlot,
  getMultipleDoctorsAvailability
};