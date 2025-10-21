import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import IconButton from '../IconButton';
import NotificationBell from '../NotificationBell';
// Import the new modal
import AccountSettingsModal from './AccountSettingsModal';

// Import SweetAlert
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css'; // Import styles

const DashboardHeader = ({
  loggedInUser,
  handleLogout, // This is the original logout function from Dashboard.tsx
  onUserUpdate, // Get the new prop
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  // State to control the settings modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to close dropdown
  useEffect(() => {
    if (!showAccountDropdown) return;
    const handler = (e) => {
      // Use optional chaining for safety
      const target = e.target;
      if (
        !target?.closest('#account-dropdown-btn') &&
        !target?.closest('#account-dropdown-menu')
      ) {
        setShowAccountDropdown(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showAccountDropdown]);

  // --- New Logout Confirmation Function ---
  const confirmLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to logout.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'No, stay',
    }).then((result) => {
      // If user clicks "Yes"
      if (result.isConfirmed) {
        handleLogout(); // Call the original logout function
      }
    });
  };

  // --- Helpers (Title, Breadcrumb) ---
  const handleHome = () => navigate('/dashboard');

  function prettify(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  const currentTitle = (() => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Dashboard Overview';
    if (p.startsWith('/dashboard/forms')) return 'Assessment Forms';
    if (p.startsWith('/dashboard/patient-records'))
      return 'Patient Information';
    if (p.startsWith('/dashboard/parental-training'))
      return 'Parental Training';
    if (p.startsWith('/dashboard/qr-attendance')) return 'QR Attendance';
    if (p.startsWith('/dashboard/therapy-tracking')) return 'Therapy Tracking';
    if (p.startsWith('/dashboard/therapy-sessions')) return 'Therapy Sessions';
    if (p.startsWith('/dashboard/appointments'))
      return 'Appointment Management';
    if (p.startsWith('/dashboard/manage-users')) return 'Manage Users';
    if (p.startsWith('/dashboard/rdhs')) return 'RDHS';
    if (p.startsWith('/dashboard/reports')) return 'Reports';
    if (p.startsWith('/dashboard/documents')) return 'Documents';
    if (p.startsWith('/dashboard/adminuploaddocs'))
      return 'Upload Resources for Patents';
    if (p.startsWith('/dashboard/viewdocs'))
      return 'View Resources for Patents';
    if (p.startsWith('/dashboard/forms/monreturn'))
      return 'Upload Monthly Returns ';
    return 'Welcome';
  })();

  const breadcrumb = (() => {
    const base = [{ label: 'Dashboard', onClick: handleHome }];
    const parts = location.pathname
      .replace('/dashboard', '')
      .split('/')
      .filter(Boolean);
    const crumbs = parts.map((seg, idx) => {
      const href = '/dashboard/' + parts.slice(0, idx + 1).join('/');
      return {
        label: prettify(seg),
        onClick: () => navigate(href),
      };
    });
    return [...base, ...crumbs];
  })();

  return (
    // Wrap in a fragment to include the modal
    <>
      <header className="flex items-center justify-between gap-4 p-5 bg-white border-b-4 border-blue-600 shadow-md sticky top-0 z-10">
        {/* Breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-300">/</span>}
                <button
                  onClick={c.onClick}
                  className="hover:text-blue-700 focus:outline-none focus:underline"
                  title={`Go to ${c.label}`}
                >
                  {c.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentTitle}
            </h2>
            {currentTitle === 'Dashboard Overview' && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Quick glance of activity, tasks, and patient pipeline.
          </p>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-2">
          {loggedInUser && <NotificationBell user={loggedInUser} />}

          {/* Add onClick to open the modal */}
          <IconButton
            icon={faCog}
            title="Settings"
            onClick={() => setIsSettingsModalOpen(true)}
          />

          {/* User Account Dropdown */}
          {loggedInUser ? (
            <div className="relative">
              <button
                id="account-dropdown-btn"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm shadow-inner cursor-pointer hover:bg-blue-100 transition-colors"
                title="Account"
                onClick={() => setShowAccountDropdown((v) => !v)}
              >
                <div className="h-6 w-6 rounded-full bg-blue-200 grid place-items-center text-xs font-bold">
                  {loggedInUser.firstName?.[0]}
                  {loggedInUser.lastName?.[0]}
                </div>
                <span className="hidden sm:block">
                  Hi, {loggedInUser.firstName} {loggedInUser.lastName}
                </span>
                <svg
                  className={`ml-1 w-3 h-3 transition-transform ${
                    showAccountDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showAccountDropdown && (
                <div
                  id="account-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                >
                  {/* Change onClick to use confirmLogout */}
                  <button
                    onClick={confirmLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Show loading state while user is being fetched
            <div className="flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-sm animate-pulse">
              Loading User…
            </div>
          )}
        </div>
      </header>

      {/* === FIX HERE ===
        The AccountSettingsModal component tag is now correctly self-closed with "/>"
      */}
      {isSettingsModalOpen && (
        <AccountSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          user={loggedInUser}
          onUserUpdate={onUserUpdate}
        />
      )}
    </>
  );
};

export default DashboardHeader;