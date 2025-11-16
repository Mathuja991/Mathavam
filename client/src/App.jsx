// App.jsx Update
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientRecordForm from './pages/RecordSheet/PatientRecordForm';
import SkillAssessmentFlow from './pages/SpeechAndTheropyAssessment/SkillAssessmentFlow';
import PatientRecordList from './pages/RecordSheet/PatientRecordList';
import LoginForm from './pages/Auth/LoginForm';
import ManageUser from './pages/ManageUsers/ManageUser';
import AddNewUser from './pages/ManageUsers/AddNewUser';
import TherapyAssessmentList from './pages/SpeechAndTheropyAssessment/TherapyAssessmentList';
import ViewTherapyAssessment from './pages/SpeechAndTheropyAssessment/ViewTherapyAssessment';

//varsha parts
import "./App.css";
import SensoryProfileCreatePage from "./pages/SensoryProfile/SensoryProfileCreatePage";
import SensoryProfileReadPage from "./pages/SensoryProfile/SensoryProfileReadPage";
import SensoryProfileEditPage from "./pages/SensoryProfile/SensoryProfileEditPage";
import ServiceQrPage from "./pages/QrAttendance/ServiceQRPage";
import ChildManagementPage from "./pages/QrAttendance/ChildManagementPage";
import ParentQrViewPage from "./pages/QrAttendance/ParentQrViewPage";
import AdminQrAttendancePage from "./pages/QrAttendance/AdminQrAttendancePage";

//Mathuja

import AdminDashboard from './components/AdminDashboard';
import Carsform from './forms/carsform';
import MathavamFlowchart from './forms/MathavamFlowchart';
import CarsPrevious from "./components/CarsPrevious";
import FormHome from "./components/FormHome";
import MonthlyReturnForm from './forms/MonthlyReturnForm';

import EditCarEntry from "./components/EditCarEntry";
import MFPrevious from './components/MFPrevious';
import Bcform from './forms/Bcform';
import BcPrevious from './components/BcPrevious';
import CarsProgress from './components/CarsProgress';
import BcProgress from './components/BcProgress';
import EditBcEntry from './components/EditBcEntry';
import EditMfEntry from './components/EditMfEntry';
import ViewPatientRecord from './pages/RecordSheet/ViewPatientRecord';

import AdminUploadDocument from './components/doc_parent/AdminUploadDocument';
import UserViewDocuments from './components/doc_parent/UserViewDocuments';

//kujinsika
import DSM5Form from './pages/DSM5/DSM5Form';
import ViewDSM5Form from './pages/DSM5/ViewDSM5Form';
import SnapForm from './pages/SNAP/SnapForm';
import SubmittedSnapFormsList from './pages/SNAP/SubmittedSnapFormsList';
import SubmittedFormsList from './pages/DSM5/SubmittedFormsList';


import AppointmentManagement from './pages/Appointment/AppointmentManagement';
import DoctorAppointmentBooking from './pages/Appointment/DoctorAppointmentBooking';
import ServiceBookingForm from './pages/Appointment/ServiceBookingForm';
import SessionBookingForm from './pages/Appointment/SessionBookingForm'; // If you keep it
import PractitionerCalendar from './pages/Appointment/PractitionerCalendar'; // NEW
import AllAppointmentsList from './pages/Appointment/AllAppointmentsList'; // Will create this next for Admin view


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />

        {/* Dashboard Layout - All nested routes will render inside the Dashboard's Outlet */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Default content for /dashboard. You can choose any component here, or redirect */}
          <Route index element={<AdminDashboard />} />{" "}
          {/* This will be the content for /dashboard if you navigate directly to it */}
          <Route path="dashboard" element={<AdminDashboard />} />{" "}
          {/* Also handle direct /dashboard access */}
          {/* Patient Record Routes */}
          <Route path="record-sheet" element={<PatientRecordForm />} />
          <Route
            path="skill-assessment"
            element={<SkillAssessmentFlow />}
          />{" "}
          {/* This seems like a specific flow, consider if it needs the full layout */}
          <Route path="patient-records" element={<PatientRecordList />} />
          <Route path="patient-records/new" element={<PatientRecordForm />} />
          <Route path="patient-records/:id" element={<ViewPatientRecord />} />
          <Route
            path="patient-records/edit/:id"
            element={<PatientRecordForm />}
          />
          <Route path="manage-users" element={<ManageUser />} />
          <Route path="manage-users/add" element={<AddNewUser />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route
            path="appointments/doctor-booking"
            element={<DoctorAppointmentBooking />}
          />
          <Route
            path="appointments/service-booking"
            element={<ServiceBookingForm />}
          />
          {/* Conditionally include if you decide to keep SessionBookingForm distinct */}
          <Route
            path="appointments/session-booking"
            element={<SessionBookingForm />}
          />
          <Route
            path="therapy-assessments-list"
            element={<TherapyAssessmentList />}
          />
          <Route
            path="therapy-assessments/:id"
            element={<ViewTherapyAssessment />}
          />
          {/* New Appointment Routes for Specific User Types */}
          <Route
            path="appointments/my-schedule"
            element={<PractitionerCalendar />}
          />{" "}
          {/* Doctors/Therapists */}
          <Route
            path="appointments/all"
            element={<AllAppointmentsList />}
          />{" "}
          {/* Admin/Super Admin (Next Part) */}
          {/* Varsha's Sensory Profile Routes */}
          <Route
            path="sensory-profile-fill-form"
            element={<SensoryProfileCreatePage />}
          />
          <Route
            path="sensory-profile-view"
            element={<SensoryProfileReadPage />}
          />
          <Route
            path="sensory-profile/edit/:id"
            element={<SensoryProfileEditPage />}
          />
          {/*Varsha QR*/}
          <Route path="service-qr" element={<ServiceQrPage />} />
          <Route path="manage-children" element={<ChildManagementPage />} />
          <Route path="parent-view/:childNo" element={<ParentQrViewPage />} />
          <Route path="qr-attendance" element={<AdminQrAttendancePage />} />
          {/* Mathuja's Parts */}
          <Route path="forms" element={<FormHome />} />
          <Route path="forms/Carsform" element={<Carsform />} />
          <Route path="forms/carsform-previous-entries" element={<CarsPrevious />} />
          <Route path="editcar/:id" element={<EditCarEntry />} />
          <Route
            path="forms/mathavamflowchart"
            element={<MathavamFlowchart />}
          />
          <Route
            path="mathavamflowchartprevious-entries"
            element={<MFPrevious />}
          />
          <Route path="forms/behavioral-checklist" element={<Bcform />} />
          <Route path="forms/bc-previous-entries" element={<BcPrevious />} />
          <Route path="forms/cars-progress" element={<CarsProgress />} />
          <Route path="forms/bc-progress" element={<BcProgress />} />
          <Route path="editb/:id" element={<EditBcEntry />} />
          <Route path="editm/:id" element={<EditMfEntry />} />
          
          {/* FIX: Monthly Returns Route එක /forms/ monreturn සිට /monreturn වෙත වෙනස් කරන ලදි */}
          <Route path="monreturn" element={<MonthlyReturnForm />} />
          
          <Route path="adminuploaddocs" element={<AdminUploadDocument />} />
          <Route path="viewdocs" element={<UserViewDocuments />} />

          {/*Kujinsika*/}
          <Route path="snap-submitted-forms" element={<SubmittedSnapFormsList />} />
          <Route path="SnapForm" element={<SnapForm />} />
          <Route path="SnapForm/:id" element={<SnapForm />} />

          <Route path="submitted-dsm5-forms" element={<SubmittedFormsList />} />
          <Route path="DSM5Form" element={<DSM5Form />} />
          <Route path="view-dsm5-form/:id" element={<ViewDSM5Form />} />

          {/* Catch-all for routes within Dashboard layout (optional, but good for empty states) */}
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center h-full">
                <p className="text-xl text-gray-600">
                  Select an option from the sidebar.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;