import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faUsers,
  faHome,
  faNotesMedical,
  faUserGraduate,
  faQrcode,
  faHeartbeat,
  faClipboardList,
  faCalendarCheck,
  faHospital,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import NavItem from '../NavItem';
import SectionLabel from '../SectionLabel';

// Props type එක නිර්වචනය කිරීම
interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  loggedInUser: any; // ඔබට අවශ්‍ය නම් මෙතනට නියමිත User type එක යොදන්න
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  loggedInUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Actions (Navigation handlers) ---
  const handleHome = () => navigate('/dashboard');
  const handleSkillAssessmentForms = () => navigate('/dashboard/forms');
  const handleRecordingSheet = () => navigate('/dashboard/patient-records');
  const handleAppointmentManagement = () => navigate('/dashboard/appointments');
  const handleParentalTraining = () => navigate('/dashboard/parental-training');
  const handleQRAttendance = () => navigate('/dashboard/qr-attendance');
  const handleTherapyTracking = () => navigate('/dashboard/therapy-tracking');
  const handleDocuments = () => navigate('/dashboard/documents');
  const handleTherapySessions = () => navigate('/dashboard/therapy-sessions');
  const handleReports = () => navigate('/dashboard/reports');
  const handleManageUsers = () => navigate('/dashboard/manage-users');
  const handleAddNewUser = () => navigate('manage-users/add');
  const handleRDHS = () => navigate('/dashboard/rdhs');
  const handleParentsReadingResources = () =>
    navigate('/dashboard/adminuploaddocs');
  const handleMonthlyReturns = () => navigate('/dashboard/forms/monreturn');
  const handleViewofParentsReadingResources = () =>
    navigate('/dashboard/viewdocs');

  // --- Helpers ---
  const isActive = (path: string) => {
    if (path === '/dashboard/skill-assessment') {
      return (
        location.pathname === '/dashboard/skill-assessment' ||
        location.pathname === '/dashboard/prerequisite-skill' ||
        location.pathname === '/dashboard/communication' ||
        location.pathname === '/dashboard/language' ||
        location.pathname === '/dashboard/speech' ||
        location.pathname === '/dashboard/oralmotor-assessment'
      );
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // --- Check user type (using optional chaining for safety) ---
  const canAccessPatientInfo =
    loggedInUser?.userType === 'Super Admin' ||
    loggedInUser?.userType === 'Admin';
  const canAccessAdminPanel =
    loggedInUser?.userType === 'Super Admin' ||
    loggedInUser?.userType === 'Admin';

  return (
    <aside
      className={`bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white
          transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-80' : 'w-20'
          } flex flex-col shadow-2xl relative z-20`}
      aria-label="Sidebar Navigation"
    >
      <div className="flex items-center justify-between h-20 px-4">
        <div className="flex items-center gap-3">
          {!isSidebarOpen ? (
            <button
              onClick={handleHome}
              className="rounded-xl p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              title="Dashboard Home"
            >
              <FontAwesomeIcon icon={faHome} className="text-2xl text-white" />
            </button>
          ) : (
            <h1
              onClick={handleHome}
              className="text-2xl font-extrabold tracking-tight text-white cursor-pointer drop-shadow-sm"
              title="Go Home"
            >
              Mathavam
            </h1>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="ml-2 bg-white/15 backdrop-blur text-white p-2 rounded-xl shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar ([)"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem
          icon={faHome}
          label="Dashboard Home"
          isOpen={isSidebarOpen}
          onClick={handleHome}
          isActive={isActive('/dashboard')}
          color="blue"
        />
        <SectionLabel isOpen={isSidebarOpen} text="Core" />
        {canAccessPatientInfo && (
          <NavItem
            icon={faClipboardList}
            label="Patient Information"
            isOpen={isSidebarOpen}
            onClick={handleRecordingSheet}
            isActive={isActive('/dashboard/patient-records')}
            color="sky"
          />
        )}
        <NavItem
          icon={faNotesMedical}
          label="Assessment Forms"
          isOpen={isSidebarOpen}
          onClick={handleSkillAssessmentForms}
          isActive={isActive('/dashboard/forms')}
          color="teal"
        />
        <NavItem
          icon={faHeartbeat}
          label="Therapy Tracking"
          isOpen={isSidebarOpen}
          onClick={handleTherapyTracking}
          isActive={isActive('/dashboard/therapy-tracking')}
          color="indigo"
        />
        <NavItem
          icon={faCalendarCheck}
          label="Appointment Management"
          isOpen={isSidebarOpen}
          onClick={handleAppointmentManagement}
          isActive={isActive('/dashboard/appointments')}
          color="blue"
        />
        <NavItem
          icon={faQrcode}
          label="QR Attendance"
          isOpen={isSidebarOpen}
          onClick={handleQRAttendance}
          isActive={isActive('/dashboard/qr-attendance')}
          color="sky"
        />
        <NavItem
          icon={faHospital}
          label="RDHS"
          isOpen={isSidebarOpen}
          onClick={handleRDHS}
          isActive={isActive('/dashboard/rdhs')}
          color="indigo"
        />
        <NavItem
          icon={faUserGraduate}
          label="Parental Training"
          isOpen={isSidebarOpen}
          onClick={handleParentalTraining}
          isActive={isActive('/dashboard/parental-training')}
          color="teal"
        />
        <NavItem
          icon={faUserGraduate}
          label="Resources for Parents"
          isOpen={isSidebarOpen}
          onClick={handleViewofParentsReadingResources}
          isActive={isActive('/dashboard/viewdocs')}
          color="teal"
        />
        {canAccessAdminPanel && (
          <>
            <SectionLabel isOpen={isSidebarOpen} text="Admin" />
            <NavItem
              icon={faUsers}
              label="Manage Users"
              isOpen={isSidebarOpen}
              onClick={handleManageUsers}
              isActive={isActive('/dashboard/manage-users')}
              color="blue"
            />
            <NavItem
              icon={faNotesMedical}
              label="Upload Reading Resources for Parents "
              isOpen={isSidebarOpen}
              onClick={handleParentsReadingResources}
              isActive={isActive('/dashboard/adminuploaddocs')}
              color="blue"
            />
            <NavItem
              icon={faNotesMedical}
              label="Upload Monthly Returns "
              isOpen={isSidebarOpen}
              onClick={handleMonthlyReturns}
              isActive={isActive('/dashboard/forms/monreturn')}
              color="blue"
            />
          </>
        )}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;