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

  // --- Actions (Navigation handlers) ---
  const handleNavigation = (path) => {
    navigate(path);
    // Mobile එකේදී sidebar එක close කරන්න
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
  const handleTherapyTracking = () => handleNavigation('/dashboard/therapy-tracking');
  const handleRDHS = () => handleNavigation('/dashboard/rdhs');
  const handleViewofParentsReadingResources = () => handleNavigation('/dashboard/viewdocs');
  const handleManageUsers = () => handleNavigation('/dashboard/manage-users');
  const handleParentsReadingResources = () => handleNavigation('/dashboard/adminuploaddocs');
  const handleMonthlyReturns = () => handleNavigation('/dashboard/forms/monreturn');


  // --- Helpers ---
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

  // --- Check user type ---
  const canAccessPatientInfo =
    loggedInUser?.userType === 'Super Admin' ||
    loggedInUser?.userType === 'Admin';
  const canAccessAdminPanel =
    loggedInUser?.userType === 'Super Admin' ||
    loggedInUser?.userType === 'Admin';

  return (
    <aside
      // FIX: md:top-3 සහ md:bottom-3 ඉවත් කරනවා. 
      // Desktop එකේදී මුළු උස පුරාම (full height) විහිදෙනවා.
      // md:rounded-r-3xl ඉවත් කරනවා. මුළු Sidebar එකම full height වන නිසා corner round කිරීම අවශ්‍ය නැත.
      className={`bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white
          transition-all duration-300 ease-in-out shadow-2xl z-40 h-full flex-shrink-0 
          
          // Default (Mobile) styles: Fixed, Full Height, 64w. Slide In/Out via transform.
          fixed top-0 bottom-0 left-0 w-64 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          
          // Desktop/Tablet (md) styles: Overwrite mobile positioning. Use absolute width, keep fixed positioning
          // md:top-3, md:bottom-3, md:rounded-r-3xl ඉවත් කර ඇත
          md:translate-x-0 md:flex md:flex-col
          ${isSidebarOpen ? 'md:w-80' : 'md:w-20'} 
          
          `} 
      aria-label="Sidebar Navigation"
    >
      <div className="flex items-center justify-between h-20 px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mathavam Title: Sidebar Open නම් පමණක් පෙන්වන්න (Mobile/Desktop දෙකේදීම) */}
          {isSidebarOpen ? (
            <h1
              onClick={handleHome}
              className={`text-2xl font-extrabold tracking-tight text-white cursor-pointer drop-shadow-sm`}
              title="Go Home"
            >
              Mathavam
            </h1>
          ) : (
            /* Small Icon: Sidebar Closed නම් පමණක් පෙන්වන්න (Desktop/Tablet) */
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
          title={isSidebarOpen ? "Close Menu" : "Open Menu"}
        >
          {/* Mobile Overlay එකේදී close icon එක (X) පෙන්වන්න */}
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