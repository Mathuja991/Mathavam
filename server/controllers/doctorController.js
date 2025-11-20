const Doctor = require('../models/Doctor');

const generateStaffId = async () => {
  const prefix = 'STAFF';
  try {
    const lastStaff = await Doctor.findOne().sort({ createdAt: -1 });
    
    let nextId = 1;
    if (lastStaff && lastStaff.doctorId && lastStaff.doctorId.startsWith(prefix)) {
      const lastIdNum = parseInt(lastStaff.doctorId.replace(prefix, ''), 10);
      if (!isNaN(lastIdNum)) {
        nextId = lastIdNum + 1;
      }
    }
    return `${prefix}${String(nextId).padStart(4, '0')}`;
  } catch (error) {
    console.error("Error generating staff ID, falling back to random:", error);
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  }
};


const createDoctor = async (req, res) => {
  try {
    const { 
        firstName, lastName, doctorEmail, doctorPhone, 
        role, dateOfJoining, salary, qualification, experience 
    } = req.body;

    const newStaffId = await generateStaffId();

    const existingDoctor = await Doctor.findOne({ doctorEmail });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Staff member with this email already exists' });
    }

    const doctor = new Doctor({
      doctorId: newStaffId,
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
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'A staff member with these details already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { doctorId, ...updateData } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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
};