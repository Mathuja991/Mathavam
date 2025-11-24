import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientRecordForm from './pages/RecordSheet/PatientRecordForm';
import PatientRecordFormAuto from './pages/RecordSheet/PatientRecordFormAuto';
import SkillAssessmentFlow from './pages/SpeechAndTheropyAssessment/SkillAssessmentFlow';
import PatientRecordList from './pages/RecordSheet/PatientRecordList';
import LoginForm from './pages/Auth/LoginForm';
import ManageUser from './pages/ManageUsers/ManageUser';
import AddNewUser from './pages/ManageUsers/AddNewUser';
import TherapyAssessmentList from './pages/SpeechAndTheropyAssessment/TherapyAssessmentList';
import ViewTherapyAssessment from './pages/SpeechAndTheropyAssessment/ViewTherapyAssessment';

import "./App.css";
import SensoryProfileCreatePage from "./pages/SensoryProfile/SensoryProfileCreatePage";
import SensoryProfileSectionsPage from "./pages/SensoryProfile/SensoryProfileSectionsPage";
import SensoryProfileReadPage from "./pages/SensoryProfile/SensoryProfileReadPage";
import SensoryProfileEditPage from "./pages/SensoryProfile/SensoryProfileEditPage";
import SensoryProfileProgressPage from "./pages/SensoryProfile/SensoryProfileProgressPage";
import ServiceQrPage from "./pages/QrAttendance/ServiceQRPage";
import ChildManagementPage from "./pages/QrAttendance/ChildManagementPage";
import ParentQrViewPage from "./pages/QrAttendance/ParentQrViewPage";
import AdminQrAttendancePage from "./pages/QrAttendance/AdminQrAttendancePage";


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

import DSM5Form from './pages/DSM5/DSM5Form';
import ViewDSM5Form from './pages/DSM5/ViewDSM5Form';
import SnapForm from './pages/SNAP/SnapForm';
import SubmittedSnapFormsList from './pages/SNAP/SubmittedSnapFormsList';
import SubmittedFormsList from './pages/DSM5/SubmittedFormsList';

import Add_doctors from './forms/Add_doctors';
import DoctorAvailability from './pages/Appointment/DoctorAvailability';
import Book_doctor_appoinment from './pages/Appointment/Book_doctor_appoinment';
import PatientAppointment from './pages/Appointment/PatientAppoinment';


import AppointmentManagement from './pages/Appointment/AppointmentManagement';
import ServiceBookingForm from './pages/Appointment/ServiceBookingForm';
import PractitionerCalendar from './pages/Appointment/PractitionerCalendar';
import AllAppointmentsList from './pages/Appointment/AllAppointmentsList';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<AdminDashboard />} />{" "}
          <Route path="dashboard" element={<AdminDashboard />} />{" "}
          <Route path="record-sheet" element={<PatientRecordForm />} />
          <Route
            path="skill-assessment"
            element={<SkillAssessmentFlow />}
          />{" "}
          <Route path="patient-records" element={<PatientRecordList />} />
          <Route path="patient-records/new" element={<PatientRecordForm />} />
          <Route path="patient-records/new-auto" element={<PatientRecordFormAuto />} />
          <Route path="patient-records/:id" element={<ViewPatientRecord />} />
          <Route
            path="patient-records/edit/:id"
            element={<PatientRecordForm />}
          />
          <Route path="manage-users" element={<ManageUser />} />
          <Route path="manage-users/add" element={<AddNewUser />} />
          <Route path="appointments" element={<AppointmentManagement />} />

          <Route
            path="appointments/service-booking"
            element={<ServiceBookingForm />}
          />


          <Route
            path="therapy-assessments-list"
            element={<TherapyAssessmentList />}
          />
          <Route
            path="therapy-assessments/:id"
            element={<ViewTherapyAssessment />}
          />
          <Route
            path="appointments/my-schedule"
            element={<PractitionerCalendar />}
          />{" "}
          <Route
            path="appointments/all"
            element={<AllAppointmentsList />}
          />{" "}
          <Route
            path="sensory-profile-fill-form"
            element={<SensoryProfileCreatePage />}
          />
          <Route
            path="sensory-profile-sections"
            element={<SensoryProfileSectionsPage />}
          />
          <Route
            path="sensory-profile-view"
            element={<SensoryProfileReadPage />}
          />
          <Route
            path="sensory-profile-progress"
            element={<SensoryProfileProgressPage />}
          />
          <Route
            path="sensory-profile/edit/:id"
            element={<SensoryProfileEditPage />}
          />
          <Route path="service-qr" element={<ServiceQrPage />} />
          <Route path="manage-children" element={<ChildManagementPage />} />
          <Route path="parent-view/:childNo" element={<ParentQrViewPage />} />
          <Route path="qr-attendance" element={<AdminQrAttendancePage />} />
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


          <Route path="monreturn" element={<MonthlyReturnForm />} />

          <Route path="adminuploaddocs" element={<AdminUploadDocument />} />
          <Route path="viewdocs" element={<UserViewDocuments />} />

          <Route path="snap-submitted-forms" element={<SubmittedSnapFormsList />} />
          <Route path="snapform" element={<SnapForm />} />
          <Route path="snapform/:id" element={<SnapForm />} />

          <Route path="submitted-dsm5-forms" element={<SubmittedFormsList />} />
          <Route path="dsm5form" element={<DSM5Form />} />
          <Route path="view-dsm5-form/:id" element={<ViewDSM5Form />} />

          <Route path="add-doctors" element={<Add_doctors />} />
          <Route path="appointments/manage-availability" element={<DoctorAvailability />} />
          <Route path="appointments/book-appointment" element={<Book_doctor_appoinment />} />
          <Route path="appointments/patient-appointments" element={<PatientAppointment />} />

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