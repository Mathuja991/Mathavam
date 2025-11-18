const Appointment = require('../models/DoctorAppointment');

// Generate unique appointment number
const generateAppointmentNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const baseNumber = `APT-${year}${month}${day}`;
  
  // Find the latest appointment number for today
  const latestAppointment = await Appointment.findOne({
    appointmentNumber: { $regex: `^${baseNumber}` }
  }).sort({ appointmentNumber: -1 });
  
  if (!latestAppointment) {
    return `${baseNumber}-001`;
  }
  
  const lastNumber = parseInt(latestAppointment.appointmentNumber.split('-')[2]);
  const newNumber = String(lastNumber + 1).padStart(3, '0');
  
  return `${baseNumber}-${newNumber}`;
};

// Book new appointment
exports.bookAppointment = async (req, res) => {
  try {
    const {
      doctorName,
      patientName,
      appointmentDate,
      timeSlot,
      patientNote
    } = req.body;

    console.log('📦 Received appointment data:', req.body);

    // Validate required fields
    if (!doctorName || !patientName || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name, patient name, date, and time slot are required'
      });
    }

    // Fix date handling - create proper Date object
    const appointmentDateObj = new Date(appointmentDate);
    
    // Check if date is valid
    if (isNaN(appointmentDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Set time to start of day for comparison
    const startOfDay = new Date(appointmentDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🔍 Checking for existing appointments:', {
      doctorName,
      appointmentDate: appointmentDateObj,
      startTime: timeSlot.startTime
    });

    // Check if time slot is available for the doctor on that date
    const existingAppointment = await Appointment.findOne({
      doctorName,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['upcoming'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked for this doctor'
      });
    }

    // Generate appointment number
    const appointmentNumber = await generateAppointmentNumber();

    console.log('🎯 Creating new appointment with number:', appointmentNumber);

    // Create new appointment
    const appointment = new Appointment({
      appointmentNumber,
      doctorName,
      patientName,
      appointmentDate: appointmentDateObj, // Use the Date object
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      },
      patientNote: patientNote || '',
      status: 'upcoming'
    });

    await appointment.save();

    console.log('✅ Appointment saved successfully');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Update entire appointment (PUT route)
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { ...updateData, updatedAt: Date.now() } },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found for update'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('❌ Error updating entire appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorName, patientName } = req.query;
    
    // Auto-update statuses before fetching
    const now = new Date();
    await Appointment.updateMany(
      {
        appointmentDate: { $lt: now },
        status: 'upcoming'
      },
      {
        $set: { status: 'completed' }
      }
    );
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (doctorName) {
      filter.doctorName = { $regex: doctorName, $options: 'i' };
    }
    
    if (patientName) {
      filter.patientName = { $regex: patientName, $options: 'i' };
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// **MISSING FUNCTION ADDED HERE to solve the error**
// Function to update a single appointment's status (used by the route: PUT /:id/status)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!status || !['upcoming', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing status provided (must be upcoming, completed, or cancelled)'
        });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { status: status, updatedAt: Date.now() } },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status} successfully`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('❌ Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Auto-update appointment status based on date (Original function)
exports.updateAppointmentStatuses = async () => {
  try {
    const now = new Date();
    
    // Update past appointments to 'completed'
    await Appointment.updateMany(
      {
        appointmentDate: { $lt: now },
        status: 'upcoming'
      },
      {
        $set: { status: 'completed' }
      }
    );
    
    console.log('✅ Appointment statuses updated automatically');
  } catch (error) {
    console.error('Error updating appointment statuses:', error);
  }
};

// Call this function periodically or modify getAppointments to auto-update
// Get appointments by doctor and date
exports.getAppointmentsByDoctorAndDate = async (req, res) => {
  try {
    const { doctorName, date } = req.params;
    
    if (!doctorName || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name and date are required'
      });
    }

    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorName,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['upcoming'] }
    });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};