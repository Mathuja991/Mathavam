require('dotenv').config();
const mongoose = require("mongoose");


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const therapyAssessmentRoutes = require('./routes/therapyAssessmentRoutes');
const medicalAssessmentRoutes = require('./routes/medicalAssessmentRoutes');
const patientRecordsRouter = require('./routes/patientRecords');
const assessmentRoutes = require('./routes/assessmentRoutes');
const appointmentRoutes = require('./routes/appointments'); 
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Mathuja's routes
const ChildRoutes = require('./routes/ChildRoutes.js');
const CarsformRoutes = require('./routes/CarsformRoutes.js');
const MflowchartRoutes = require('./routes/MflowchartRoutes.js');
const BcRoutes = require('./routes/BcRoutes.js');
const monthReturnRoutes =require('./routes/monthReturnRoutes.js');

//kujinsika
const availabilityRoutes = require('./routes/availabilityRoutes');



const documentRoutes = require('./routes/documentRoutes.js');
const authRoutes = require('./routes/authRoutes'); 

//Varsha's QR part
const adminQrRoutes = require("./routes/adminQrRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
// IMPORTANT: Place these BEFORE your routes for proper request body parsing and CORS handling
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON data

// Use Routes
app.use('/api/therapyAssessments', therapyAssessmentRoutes);
app.use('/api/medicalAssessments', medicalAssessmentRoutes);
app.use('/api/patientRecords', patientRecordsRouter);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/auth', authRoutes);  //api/auth/login
app.use("/api/child", ChildRoutes);
app.use("/api/sessions", sessionRoutes);

// Mathuja's Routes

app.use('/api/carsform', CarsformRoutes);
app.use('/api/mflow', MflowchartRoutes);
app.use('/api/bc', BcRoutes);
app.use('/api/monthlyreturns', monthReturnRoutes);

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use('/api/documents', documentRoutes);

//Kujinsika's routes
app.use("/api/snapforms", require("./routes/SnapRoutes"));
app.use("/api/dsm5forms", require("./routes/DSM5Routes"));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', availabilityRoutes);
app.use('/api/doctorappointments', require('./routes/DoctorAppointment'));


//varsha's qr routes
app.use("/api/adminqr", adminQrRoutes);

// Basic Root Route
app.get('/', (req, res) => {
    res.send('Mathavam Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});