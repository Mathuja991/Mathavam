import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faClipboardList,
  faHospital,
  faUsers,
  faHourglassHalf,
  faSpinner,
  faPills, // Doctor
  faBrain, // Therapist/Assessment
  faChartLine, // Super Admin/Admin
  faChild, // Parent
  faNotesMedical, // Medical Records/Docs
  faQrcode, // QR Code
  faExclamationTriangle, // Error icon
  faBolt, // Icon for Quick Actions header
  faLink, // Icon for Parent Quick Links header
} from '@fortawesome/free-solid-svg-icons';

// --- Placeholder Components (Due to Single-File Constraint) ---
// Note: In a real multi-file project, these would be imported from separate files.
// We are defining basic representations here for the component to function.

const StatCard = ({ title, value, desc, icon, iconColor, bgColor }) => (
  <div className={`p-4 rounded-xl flex items-center space-x-4 ${bgColor}`}>
    <div className={`text-4xl ${iconColor}`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  </div>
);

const QuickAction = ({ title, desc, onClick, icon, bgColor }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-xl text-white transform hover:scale-[1.03] transition-all duration-300 ease-in-out shadow-lg ${bgColor} flex flex-col items-start text-left min-h-[150px]`}
  >
    <FontAwesomeIcon icon={icon} className="text-3xl mb-3" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-sm opacity-90">{desc}</p>
  </button>
);

// --- Utility Functions (Auth/API) ---

// **Note: Please configure this base URL in your environment variables (.env)**
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; 

/**
 * Retrieves the authorization configuration with the token from local storage.
 * @returns {object} Auth headers config.
 */
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    return { headers: {} };
  }
  return {
    headers: {
      // This header is used by your existing utility/middleware
      'x-auth-token': token,
    },
  };
};

// --- Dashboard Content Components (Staff Roles) ---

const StaffDashboardContent = ({ stats, handleNavigation, loggedInUser }) => {
  const isSuperAdminOrAdmin = ['Super Admin', 'Admin'].includes(loggedInUser.userType);
  const isDoctor = loggedInUser.userType === 'Doctor';
  const isTherapist = loggedInUser.userType === 'Therapist';
  const canRecord = isDoctor || isTherapist;

  // Navigation handlers
  const handleRecordingSheet = () => handleNavigation('/dashboard/patient-records');
  const handleAppointmentManagement = () => handleNavigation('/dashboard/appointments');
  const handleAdminDocs = () => handleNavigation('/dashboard/adminuploaddocs');
  const handleMonthlyReturns = () => handleNavigation('/dashboard/monreturn');
  const handleManageUsers = () => handleNavigation('/dashboard/manage-users');
  const handleRDHS = () => handleNavigation('/dashboard/rdhs-dash');

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* --- Statistics Overview (All Staff) --- */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-500/50 pb-2 flex items-center gap-2">
        My Dashboard ({loggedInUser.userType}) <FontAwesomeIcon icon={faUsers} className="text-2xl text-indigo-600" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder Stat Cards - using fetched stats. 'value' will show spinner if null */}
        <StatCard
          title="Total Patients"
          value={stats.totalPatients || <FontAwesomeIcon icon={faSpinner} spin />}
          desc="Registered in the system"
          icon={faUsers}
          iconColor="text-indigo-500"
          bgColor="bg-white hover:bg-indigo-50 shadow-lg border-l-4 border-indigo-500 transition-all duration-300"
        />
        <StatCard
          title="Appointments Today"
          value={stats.appointmentsToday || <FontAwesomeIcon icon={faSpinner} spin />}
          desc="Scheduled for the day"
          icon={faCalendarCheck}
          iconColor="text-emerald-500"
          bgColor="bg-white hover:bg-emerald-50 shadow-lg border-l-4 border-emerald-500 transition-all duration-300"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingTasks || <FontAwesomeIcon icon={faSpinner} spin />}
          desc="Therapy Service"
          icon={faHourglassHalf}
          iconColor="text-yellow-500"
          bgColor="bg-white hover:bg-yellow-50 shadow-lg border-l-4 border-yellow-500 transition-all duration-300"
        />
        <StatCard
          title="Active Staff"
          value={stats.activeStaff || <FontAwesomeIcon icon={faSpinner} spin />}
          desc="Users currently logged in"
          icon={faUsers}
          iconColor="text-purple-500"
          bgColor="bg-white hover:bg-purple-50 shadow-lg border-l-4 border-purple-500 transition-all duration-300"
        />
      </div>

      {/* --- Quick Actions --- */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-500/50 pb-2 flex items-center gap-2">
          Quick Actions <FontAwesomeIcon icon={faBolt} className="text-2xl text-yellow-500" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {canRecord && (
            <QuickAction
              title="Record New Patient"
              desc="Add demographics & intake"
              onClick={handleRecordingSheet}
              icon={faClipboardList}
              bgColor="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl"
            />
          )}

          <QuickAction
            title="Schedule Session"
            desc="Book a therapy appointment"
            onClick={handleAppointmentManagement}
            icon={faCalendarCheck}
            bgColor="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl"
          />

          {isSuperAdminOrAdmin && (
            <QuickAction
              title="Manage Users"
              desc="Add, modify, or delete user accounts"
              onClick={handleManageUsers}
              icon={faUsers}
              // Color adjusted: Fuchsia/Pink -> Deep Purple/Indigo
              bgColor="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 shadow-xl"
            />
          )}

          {isSuperAdminOrAdmin && (
            <QuickAction
              title="Monthly Returns"
              desc="Upload monthly performance reports"
              onClick={handleMonthlyReturns}
              icon={faChartLine}
              // Color adjusted: Orange/Red -> Blue/Cyan
              bgColor="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-xl"
            />
          )}

         
          <QuickAction
            title="Upload Resources"
            desc="Share reading materials for parents"
            onClick={handleAdminDocs}
            icon={faNotesMedical}
            bgColor="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Content Components (Parent Role) ---

const ParentDashboardContent = ({ handleNavigation, loggedInUser }) => {
  // Navigation handlers
  const handleViewDocs = () => handleNavigation('/dashboard/viewdocs');
  const handleQrAttendance = () => handleNavigation('/dashboard/parent-qr-view');
  const handleSkillAssessment = () => handleNavigation('/dashboard/forms');
  const handleRecordList = () => handleNavigation('/dashboard/patient-records-list');
  const handleAppointmentManagement = () => handleNavigation('/dashboard/appointments');

  return (
    <div className="p-4 md:p-8 flex flex-col h-full bg-white rounded-xl shadow-2xl">
      <header className="mb-8 border-b-2 border-blue-500/50 pb-4">
        <h1 className="text-4xl font-extrabold text-blue-800">
          Welcome, {loggedInUser.firstName}!
        </h1>
        <p className="text-xl text-blue-600 mt-2">
          Your Child: **{loggedInUser.childRegNo || 'N/A'}**
        </p>
      </header>

      <div className="flex-1 space-y-10">
        {/* Important Info/Stats */}
        <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChild} className="text-blue-500" /> Child's Status
          </h2>
          <p className="text-lg text-gray-700">
            Keep track of your child's records, attendance, and important resources here.
          </p>
        </section>

        {/* Quick Actions for Parents */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Parent Quick Links <FontAwesomeIcon icon={faLink} className="text-2xl text-gray-500" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="View Attendance QR"
              desc="Generate and scan your child's attendance QR code for sessions."
              onClick={handleQrAttendance}
              icon={faQrcode}
              // Color adjusted: Purple/Pink -> Fuchsia/Violet
              bgColor="bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-600 hover:to-violet-700 shadow-xl"
            />
            <QuickAction
              title="View Patient Records"
              desc="Access your child's recorded clinical records (read-only)."
              onClick={handleRecordList}
              icon={faNotesMedical}
              bgColor="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-xl"
            />
            <QuickAction
              title="View Resources"
              desc="Check new reading materials and guidelines from staff."
              onClick={handleViewDocs}
              icon={faClipboardList}
              bgColor="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl"
            />
            <QuickAction
              title="Request Appointment"
              desc="Book or view upcoming therapy sessions."
              onClick={handleAppointmentManagement}
              icon={faCalendarCheck}
              bgColor="bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 shadow-xl"
            />
            <QuickAction
              title="Skill Assessments"
              desc="View or start skill assessment forms."
              onClick={handleSkillAssessment}
              icon={faBrain}
              // Color adjusted: Red/Rose -> Yellow/Amber
              bgColor="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-xl"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Main Component: DashboardHome (The Switcher) ---

const DashboardHome = ({ loggedInUser }) => {
  const [stats, setStats] = useState({
    totalPatients: null,
    appointmentsToday: null,
    pendingTasks: null,
    activeStaff: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Navigation handler
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  /**
   * Fetches the dashboard statistics from the API for staff roles.
   */
  useEffect(() => {
    // Only fetch stats for staff members
    if (loggedInUser && loggedInUser.userType !== 'Parent') {
      const fetchStats = async () => {
        setLoading(true);
        try {
          // --- ACTUAL API call ---
          // Backend route: /api/users/dashboard/stats
          const res = await axios.get(`${API_BASE_URL}/users/dashboard/stats`, getAuthConfig()); 
          
          setStats({
            totalPatients: res.data.totalPatients,
            appointmentsToday: res.data.appointmentsToday,
            pendingTasks: res.data.pendingTasks,
            activeStaff: res.data.activeStaff,
          });

        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          setStats({
            totalPatients: 'Error',
            appointmentsToday: 'Error',
            pendingTasks: 'Error',
            activeStaff: 'Error',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      // For Parents, no stats needed, just set loading to false
      setLoading(false);
    }
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <div className="text-center p-8 text-gray-500">Loading user data...</div>;
  }

  // --- Role-Based Content Rendering ---
  const userRole = loggedInUser.userType || 'Unknown';

  if (loading && userRole !== 'Parent' && userRole !== 'Unknown') {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-indigo-700">Loading Dashboard...</p>
      </div>
    );
  }

  // Determine which dashboard content to render
  switch (userRole) {
    case 'Super Admin':
    case 'Admin':
    case 'Doctor':
    case 'Therapist':
      // All staff roles use the same administrative/clinical dashboard view
      return (
        <StaffDashboardContent
          stats={stats}
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    case 'Parent':
      // The Parent role uses a tailored dashboard view
      return (
        <ParentDashboardContent
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    default:
      // If the user role is not matched (e.g., 'Unknown' or an unrecognized role)
      return (
        <div className="p-8 bg-red-50 rounded-lg shadow-lg border border-red-300 mx-auto max-w-xl mt-10 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-800">Access Error</h1>
          <p className="mt-4 text-lg text-red-700">
            Error: No specific dashboard found for user type: <span className="font-extrabold">{userRole}</span>.
          </p>
          <p className="mt-4 text-gray-600">
            Please contact the Super Admin to configure access.
          </p>
        </div>
      );
  }
};

export default DashboardHome;