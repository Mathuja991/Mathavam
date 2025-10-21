import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import IconButton from '../IconButton'; // (I cannot style this component)
import NotificationBell from '../NotificationBell'; // (I cannot style this component)
import AccountSettingsModal from './AccountSettingsModal';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const DashboardHeader = ({
  loggedInUser,
  handleLogout,
  onUserUpdate,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!showAccountDropdown) return;
    const handler = (e) => {
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

  const confirmLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to logout.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6', // --- STYLE UPDATE: Matched blue color
      cancelButtonColor: '#EF4444', // --- STYLE UPDATE: Matched red color
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'No, stay',
      customClass: {
        popup: 'font-sans rounded-lg', // Use new font
        title: 'text-slate-900',
        htmlContainer: 'text-slate-600',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

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
    // ... (rest of the titles)
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
    <>
      {/* --- STYLE UPDATE: Removed thick blue border, added subtle bottom border and shadow --- */}
      <header className="flex items-center justify-between gap-4 p-5 bg-white 
                       border-b border-slate-200/80 shadow-sm sticky top-0 z-10">
        {/* Breadcrumb */}
        <div className="min-w-0">
          {/* --- STYLE UPDATE: Updated breadcrumb colors and transitions --- */}
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-500 font-medium">
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300">/</span>}
                <button
                  onClick={c.onClick}
                  className="hover:text-blue-600 focus:outline-none focus:underline transition-colors"
                  title={`Go to ${c.label}`}
                >
                  {c.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* --- STYLE UPDATE: Updated title color --- */}
            <h2 className="text-2xl font-bold text-slate-900">
              {currentTitle}
            </h2>
            {currentTitle === 'Dashboard Overview' && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quick glance of activity, tasks, and patient pipeline.
          </p>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-2">
          {loggedInUser && <NotificationBell user={loggedInUser} />}

          <IconButton
            icon={faCog}
            title="Settings"
            onClick={() => setIsSettingsModalOpen(true)}
          />

          {/* User Account Dropdown */}
          {loggedInUser ? (
            <div className="relative">
              {/* --- STYLE UPDATE: Changed button style for a cleaner look --- */}
              <button
                id="account-dropdown-btn"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700 
                           font-medium text-sm cursor-pointer hover:bg-slate-200/70 transition-colors"
                title="Account"
                onClick={() => setShowAccountDropdown((v) => !v)}
              >
                {/* --- STYLE UPDATE: Improved avatar contrast --- */}
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-bold">
                  {loggedInUser.firstName?.[0]}
                  {loggedInUser.lastName?.[0]}
                </div>
                <span className="hidden sm:block">
                  Hi, {loggedInUser.firstName}
                </span>
                <svg
                  className={`ml-1 w-4 h-4 text-slate-500 transition-transform ${
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
                // --- STYLE UPDATE: Added padding and new hover effect ---
                <div
                  id="account-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-1.5"
                >
                  <button
                    onClick={confirmLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 
                               rounded-lg text-sm font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm animate-pulse">
              Loading User…
            </div>
          )}
        </div>
      </header>

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