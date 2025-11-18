import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faClipboardList, 
  faUsers, 
  faHourglassHalf, 
  faSpinner, 
  faChartLine, 
  faNotesMedical, 
  faBolt,
  // 🛑 නව Icon එක import කරන්න
  faClipboardCheck 
} from '@fortawesome/free-solid-svg-icons';

// UI Components import
import StatCard from '../ui/StatCard';
import QuickAction from '../ui/QuickAction';

/**
 * Dashboard content for all staff roles (Super Admin, Admin, Doctor, Therapist).
 */
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
  
  // 🛑 නව QR Attendance Navigation handler එක
  const handleQrAttendanceManagement = () => handleNavigation('/dashboard/qr-attendance'); // App.jsx route එකේ path එකට අනුව සකසා ඇත.

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* --- Statistics Overview (All Staff) --- */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-500/50 pb-2 flex items-center gap-2">
        My Dashboard ({loggedInUser.userType}) <FontAwesomeIcon icon={faUsers} className="text-2xl text-indigo-600" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards... (unchanged) */}
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
          
          {/* 🛑 නව QR Attendance Management Quick Action එක Admin/SuperAdmin සඳහා එකතු කිරීම */}
          {isSuperAdminOrAdmin && (
            <QuickAction
              title="QR Attendance Mgmt."
              desc="View, filter, and export session attendance logs."
              onClick={handleQrAttendanceManagement}
              icon={faClipboardCheck}
              // නව Color scheme: Teal/Green to distinguish from others
              bgColor="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-xl"
            />
          )}

          {isSuperAdminOrAdmin && (
            <QuickAction
              title="Manage Users"
              desc="Add, modify, or delete user accounts"
              onClick={handleManageUsers}
              icon={faUsers}
              bgColor="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 shadow-xl"
            />
          )}

          {isSuperAdminOrAdmin && (
            <QuickAction
              title="Monthly Returns"
              desc="Upload monthly performance reports"
              onClick={handleMonthlyReturns}
              icon={faChartLine}
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

export default StaffDashboardContent;