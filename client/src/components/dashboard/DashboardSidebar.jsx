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
  const handleMonthlyReturns = () => handleNavigation('/dashboard/monreturn');
  const addDoctor = () => handleNavigation('/dashboard/add-doctors');


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

  // --- ALUTH PERMISSION CONSTANTS (Obage Rules Table Eka Anuwa) ---
  // Pahu 'canAccessPatientInfo' saha 'canAccessAdminPanel' meken replace kara atha
  
  const userRole = loggedInUser?.userType; // Obage style eka (optional chaining) use karamin

  // Role booleans
  const isSuperAdmin = userRole === 'Super Admin';
  const isAdmin = userRole === 'Admin';
  const isDoctor = userRole === 'Doctor';
  // 'Resource Person' wa 'Therapist' widihata salakamu
  const isTherapist = userRole === 'Therapist' || userRole === 'Resource Person';
  const isParent = userRole === 'Parent';

  // Capability booleans (obage handlers walata anuwa)
  
  // Rule: Child Info -> View (All)
  const canViewChildInfo = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  
  // Rule: Assessment Forms -> Okkoma ayata monawa hari thiyenawa (View/CRUD)
  const canViewAssessmentsSection = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  
  // Rule: Therapy Tracking (Table eke natha, Staff walata witharak damu)
  const canViewTherapyTracking = isSuperAdmin || isAdmin || isDoctor || isTherapist;

  // Rule: Appointments -> Okkoma ayata access thiyenawa
  const canViewAppointmentsSection = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;
  
  // Rule: QR Attendance -> View (All)
  const canViewQRAttendance = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;

  // Rule: RDHS -> View (Staff), Hide (Parents)
  const canViewRDHS = isSuperAdmin || isAdmin;

  // Rule: Parental Training (Table eke natha, okkotama damu)
  const canViewParentalTraining = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;

  // Rule: Parental Resources (View) -> View (All)
  const canViewParentalResources = isSuperAdmin || isAdmin || isDoctor || isTherapist || isParent;

  // --- Admin Section Permissions ---
  // Rule: Manage Users -> CRUD (SA, A)
  const canManageUsers = isSuperAdmin || isAdmin;

  // Rule: Parental Resources (Upload) -> CRUD (Staff)
  const canUploadParentalResources = isSuperAdmin || isAdmin || isDoctor || isTherapist;

  // Rule: Monthly Returns -> CRUD (SA), View (A)
  const canAccessMonthlyReturns = isSuperAdmin || isAdmin;
  
  // Admin section eka pennanna, e athule thiyena ekak hari access thiyenawanam
  const canViewAdminSection = canManageUsers || canUploadParentalResources || canAccessMonthlyReturns;

  // --- END OF ALUTH PERMISSIONS ---
  

  return (
    <aside
      // Obage Sampurna Style String eka
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
      {/* Obage Header eka */}
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
          title={isSidebarOpen ? "Close Menu" : "Open Menu"}
        >
          {isSidebarOpen && window.innerWidth < 768 ? (
            <FontAwesomeIcon icon={faTimes} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
        </button>
      </div>

      {/* Nav Section - ME THANA ALUTH RBAC LOGIC EKA THIYENNE 
      */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem
          icon={faHome}
          label="Dashboard Home"
          isOpen={isSidebarOpen}
          onClick={handleHome}
          isActive={isActive('/dashboard')}
          color="blue"
        />

        {/* ME THAMAI WENASA: canViewChildInfo */}
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

        {/* ALUTH LOGIC: canViewAssessmentsSection */}
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

        {/* ALUTH LOGIC: canViewTherapyTracking */}
        {/*canViewTherapyTracking && (
          <NavItem
            icon={faHeartbeat}
            label="Therapy Tracking"
            isOpen={isSidebarOpen}
            onClick={handleTherapyTracking}
            isActive={isActive('/dashboard/therapy-tracking')}
            color="indigo"
          />
        )}

        {/* ALUTH LOGIC: canViewAppointmentsSection */}
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

        {/* ALUTH LOGIC: canViewQRAttendance */}
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

        {/* ALUTH LOGIC: canViewRDHS */}
        {canViewRDHS && (
          <NavItem
            icon={faHospital}
            label="RDHS"
            isOpen={isSidebarOpen}
            onClick={handleRDHS}
            isActive={isActive('/dashboard/rdhs')}
            color="indigo"
          />
        )} 

        {/* ALUTH LOGIC: canViewParentalResources */}
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
        
        {/* ALUTH ADMIN SECTION LOGIC */}
        {canViewAdminSection && (
          <>
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
              label="Add doctors "
              isOpen={isSidebarOpen}
              onClick={addDoctor}
              isActive={isActive('/dashboard/forms/add-doctor')}
              color="blue"
            />
            
           
            
            {/* Rule: Upload Resources -> Staff */}
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
            
            {/* Rule: Monthly Returns -> SA, A */}
            {canAccessMonthlyReturns && (
              <NavItem
                icon={faNotesMedical}
                label="Upload Monthly Returns "
                isOpen={isSidebarOpen}
                onClick={handleMonthlyReturns}
                isActive={isActive('/dashboard/monreturn')} // Obage pahu code eka '/dashboard/forms/monreturn' nemei, '/dashboard/monreturn'
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