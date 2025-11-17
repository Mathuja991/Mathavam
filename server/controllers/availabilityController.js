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

// @desc    Add new availability slots (without deleting existing ones)
// @route   POST /api/availability/add
// @access  Private
// Simple test version - remove all validation temporarily
const addAvailabilitySlots = async (req, res) => {
  try {
    const { doctorId, doctorName, availabilitySlots } = req.body;

    let availability = await Availability.findOne({ doctorId });

    if (!availability) {
      // CREATE NEW DOCUMENT WITH ALL SLOTS
      availability = new Availability({
        doctorId,
        doctorName,
        availabilitySlots
      });
    } else {
      // PUSH ALL NEW SLOTS
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


// @desc    Delete a specific availability slot (using URL params)
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

// ⭐️ NEW: Delete slot using request body (for frontend compatibility)
// @desc    Delete a specific availability slot (using request body)
// @route   DELETE /api/availability/delete
// @access  Private
const deleteAvailabilitySlotBody = async (req, res) => {
  try {
    const { slotId } = req.body;

    const availability = await Availability.findOne({ "availabilitySlots._id": slotId });
    if (!availability) return res.status(404).json({ success: false, message: "Slot not found" });

    const slot = availability.availabilitySlots.id(slotId);
    slot.remove();

    await availability.save();

    res.json({
      success: true,
      message: "Slot deleted successfully",
      data: slot
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Delete all availability for a doctor (using URL params)
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

// ⭐️ NEW: Clear all availability using request body (for frontend compatibility)
// @desc    Delete all availability for a doctor (using request body)
// @route   DELETE /api/availability/delete-all
// @access  Private
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

// @desc    Update a specific availability slot (using URL params)
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

// ⭐️ NEW: Update slot using request body (for frontend compatibility)
// @desc    Update a specific availability slot (using request body)
// @route   PUT /api/availability/update
// @access  Private
const updateAvailabilitySlotBody = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    const availability = await Availability.findOne({ "availabilitySlots._id": slotId });
    if (!availability) return res.status(404).json({ success: false, message: "Slot not found" });

    const slot = availability.availabilitySlots.id(slotId);
    slot.startTime = startTime;
    slot.endTime = endTime;

    await availability.save();

    res.json({
      success: true,
      data: slot,
      message: "Slot updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors from availability data
// @route   GET /api/availability/doctors/all
// @access  Private
const getAllDoctorsFromAvailability = async (req, res) => {
  try {
    const allAvailability = await Availability.find({}, "doctorId doctorName");

    // Remove duplicates using Map
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


// @desc    Get availability for multiple doctors
// @route   POST /api/availability/doctors
// @access  Private
const Availability = require('../models/Availability');

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

    // Fetch all availability documents for the given doctorIds
    const availabilityDocs = await Availability.find({
      doctorId: { $in: doctorIds }
    }).sort({ doctorId: 1 });

    // Transform data to match what frontend expects
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


// ⭐️ UPDATE YOUR EXPORTS TO INCLUDE NEW FUNCTIONS:
module.exports = {
  getDoctorAvailability,
  setAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  deleteAvailabilitySlotBody, // ADD THIS
  clearDoctorAvailability,
  clearDoctorAvailabilityBody, // ADD THIS
  updateAvailabilitySlot,
  updateAvailabilitySlotBody, // ADD THIS
  getMultipleDoctorsAvailability,
  getAllDoctorsFromAvailability// Add this
};