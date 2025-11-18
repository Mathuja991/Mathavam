const Doctor = require('../models/Doctor'); // Doctor Model used for all staff

// Helper function to generate a unique Staff ID
const generateStaffId = async () => {
  // A simple prefix
  const prefix = 'STAFF';
  try {
    // Find the last doctor/staff member created
    const lastStaff = await Doctor.findOne().sort({ createdAt: -1 }); // Assuming you have timestamps
    
    let nextId = 1;
    if (lastStaff && lastStaff.doctorId && lastStaff.doctorId.startsWith(prefix)) {
      const lastIdNum = parseInt(lastStaff.doctorId.replace(prefix, ''), 10);
      if (!isNaN(lastIdNum)) {
        nextId = lastIdNum + 1;
      }
    }
    // Pad with leading zeros to make it 4 digits (e.g., STAFF0001)
    return `${prefix}${String(nextId).padStart(4, '0')}`;
  } catch (error) {
    console.error("Error generating staff ID, falling back to random:", error);
    // Fallback in case of error (not guaranteed to be unique, but better than nothing)
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  }
};


// @desc    Create a new staff member (referred to as Doctor in the model)
// @route   POST /api/doctors
// @access  Public
const createDoctor = async (req, res) => {
  try {
    const { 
        // Note: doctorId is removed from req.body destructuring
        firstName, lastName, doctorEmail, doctorPhone, 
        role, dateOfJoining, salary, qualification, experience 
    } = req.body;

    // --- Generate Staff ID ---
    // This is the new part. We generate the ID instead of getting it from the form.
    const newStaffId = await generateStaffId();

    // Check for duplicate email
    const existingDoctor = await Doctor.findOne({ doctorEmail });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Staff member with this email already exists' });
    }

    // Create new staff member
    const doctor = new Doctor({
      doctorId: newStaffId, // Use the generated ID
      firstName,
      lastName,
      doctorEmail,
      doctorPhone,
      role,
      dateOfJoining,
      salary,
      qualification,
      experience
    });

    const savedDoctor = await doctor.save();
    res.status(201).json({ success: true, message: 'Staff member added successfully', data: savedDoctor });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    // Handle other potential errors (like duplicate key if generation logic fails)
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'A staff member with these details already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Get all staff members
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Get single staff member by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(44).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Update staff member
// @route   PUT /api/doctors/:id
// @access  Public
const updateDoctor = async (req, res) => {
  try {
    // Exclude doctorId from being updated via this route
    const { doctorId, ...updateData } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return updated doc and run validators
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.status(200).json({ success: true, message: 'Staff member updated successfully', data: doctor });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate value error.' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/doctors/:id
// @access  Public
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  // checkStaffId is removed
};