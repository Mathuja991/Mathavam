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
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import NavItem from '../NavItem';
import SectionLabel from '../SectionLabel';

const DashboardSidebar = ({
  isSidebarOpen,
  toggleSidebar,
  loggedInUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleHome = () => handleNavigation('/dashboard');
  const handleSkillAssessmentForms = () => handleNavigation('/dashboard/forms');
  const handleRecordingSheet = () => handleNavigation('/dashboard/patient-records');
  const handleAppointmentManagement = () => handleNavigation('/dashboard/appointments');
  const handleParentalTraining = () => handleNavigation('/dashboard/parental-training');
  const handleQRAttendance = () => handleNavigation('/dashboard/qr-attendance');
  const handleQRService = () => handleNavigation('/dashboard/service-qr');
  const handleTherapyTracking = () => handleNavigation('/dashboard/therapy-tracking');
  const handleRDHS = () => handleNavigation('/dashboard/rdhs');
  const handleViewofParentsReadingResources = () => handleNavigation('/dashboard/viewdocs');
  const handleManageUsers = () => handleNavigation('/dashboard/manage-users');
  const handleParentsReadingResources = () => handleNavigation('/dashboard/adminuploaddocs');
  const handleMonthlyReturns = () => handleNavigation('/dashboard/monreturn');
  const addDoctor = () => handleNavigation('/dashboard/add-doctors');

  const isActive = (path) => {
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

  const userRole = loggedInUser?.userType;

  const isSuperAdmin = userRole === 'Super Admin';
  const isAdmin = userRole === 'Admin';
  const isDoctor = userRole === 'Doctor';
  const isTherapist = userRole === 'Therapist' || userRole === 'Resource Person';
  const isParent = userRole === 'Parent';

  const canViewChildInfo = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewAssessmentsSection = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewTherapyTracking = isSuperAdmin || isAdmin || isDoctor || isTherapist;
  const canViewAppointmentsSection = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewQRAttendance = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewRDHS = isSuperAdmin || isAdmin;
  const canViewParentalTraining = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewParentalResources = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  const canViewServiceQr = isDoctor || isTherapist;

  const canManageUsers = isSuperAdmin || isAdmin;
  const canManageStaffDetails = isSuperAdmin || isAdmin;
  const canUploadParentalResources = isSuperAdmin || isAdmin || isDoctor || isTherapist;
  const canAccessMonthlyReturns = isSuperAdmin || isAdmin;

  const canViewAdminSection =
    canManageUsers ||
    canUploadParentalResources ||
    canAccessMonthlyReturns ||
    canManageStaffDetails;

  return (
    <aside
      className={`bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white
        transition-all duration-300 ease-in-out shadow-2xl z-40 h-full flex-shrink-0 
        fixed top-0 bottom-0 left-0 w-64 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex md:flex-col
        ${isSidebarOpen ? 'md:w-80' : 'md:w-20'} 
        `}
      aria-label="Sidebar Navigation"
    >
      <div className="flex items-center justify-between h-20 px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {isSidebarOpen ? (
            <h1
              onClick={handleHome}
              className={`text-2xl font-extrabold tracking-tight text-white cursor-pointer drop-shadow-sm`}
              title="Go Home"
            >
              Mathavam
            </h1>
          ) : (
            <button
              onClick={handleHome}
              className="rounded-xl p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 hidden md:block"
              title="Dashboard Home"
            >
              <FontAwesomeIcon icon={faHome} className="text-2xl text-white" />
            </button>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="ml-2 bg-white/15 backdrop-blur text-white p-2 rounded-xl shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
          aria-label="Toggle Sidebar"
          title={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isSidebarOpen && window.innerWidth < 768 ? (
            <FontAwesomeIcon icon={faTimes} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
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

        {canViewChildInfo && (
          <NavItem
            icon={faClipboardList}
            label="Patient Information"
            isOpen={isSidebarOpen}
            onClick={handleRecordingSheet}
            isActive={isActive('/dashboard/patient-records')}
            color="sky"
          />
        )}

        {canViewAssessmentsSection && (
          <NavItem
            icon={faNotesMedical}
            label="Assessment Forms"
            isOpen={isSidebarOpen}
            onClick={handleSkillAssessmentForms}
            isActive={isActive('/dashboard/forms')}
            color="teal"
          />
        )}

        {canViewAppointmentsSection && (
          <NavItem
            icon={faCalendarCheck}
            label="Appointment Management"
            isOpen={isSidebarOpen}
            onClick={handleAppointmentManagement}
            isActive={isActive('/dashboard/appointments')}
            color="blue"
          />
        )}

        {canViewQRAttendance && (
          <NavItem
            icon={faQrcode}
            label="QR Attendance"
            isOpen={isSidebarOpen}
            onClick={handleQRAttendance}
            isActive={isActive('/dashboard/qr-attendance')}
            color="sky"
          />
        )}

        {canViewParentalResources && (
          <NavItem
            icon={faUserGraduate}
            label="Parental Training"
            isOpen={isSidebarOpen}
            onClick={handleViewofParentsReadingResources}
            isActive={isActive('/dashboard/viewdocs')}
            color="teal"
          />
        )}

        
        {canViewAdminSection && (
          <>
            {canManageUsers && (
              <NavItem
                icon={faUsers}
                label="Manage Users"
                isOpen={isSidebarOpen}
                onClick={handleManageUsers}
                isActive={isActive('/dashboard/manage-users')}
                color="blue"
              />
            )}

            {canManageStaffDetails && (
              <NavItem
                icon={faClipboardList}
                label="Manage Staff Details "
                isOpen={isSidebarOpen}
                onClick={addDoctor}
                isActive={isActive('/dashboard/add-doctors')}
                color="blue"
              />
            )}

            {canViewServiceQr && (
              <NavItem
                icon={faClipboardList}
                label="QR Session"
                isOpen={isSidebarOpen}
                onClick={handleQRService}
                isActive={isActive('/dashboard/service-qr')}
                color="blue"
              />
            )}


            {canUploadParentalResources && (
              <NavItem
                icon={faNotesMedical}
                label="Upload Reading Resources for Parents "
                isOpen={isSidebarOpen}
                onClick={handleParentsReadingResources}
                isActive={isActive('/dashboard/adminuploaddocs')}
                color="blue"
              />
            )}

            {canAccessMonthlyReturns && (
              <NavItem
                icon={faNotesMedical}
                label="Upload Monthly Returns "
                isOpen={isSidebarOpen}
                onClick={handleMonthlyReturns}
                isActive={isActive('/dashboard/monreturn')}
                color="blue"
              />
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
