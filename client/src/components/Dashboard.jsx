import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardHome from './dashboard/DashboardHome';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        handleLogout();
      }
    } else {
      navigate('/');
    }

    // FIX: Initial state for mobile screens
    const handleInitialSidebarState = () => {
      // Mobile (sm/md) වලදී Sidebar එක default false කරන්න.
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        // Desktop වලදී පෙර තිබූ state එක තබා ගන්න.
        setIsSidebarOpen(true);
      }
    };

    handleInitialSidebarState(); 
  }, [navigate]);
  
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const typingInField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      // Desktop/Tablet වලට [ key එක එබූ විට Sidebar toggle කිරීම
      if (e.key === '[' && !typingInField && window.innerWidth >= 768) {
        e.preventDefault();
        setIsSidebarOpen((s) => !s);
      }
      if (e.key === '/' && !typingInField) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedInUser(null);
    navigate('/');
  };

  const handleUserUpdate = (updatedUser) => {
    setLoggedInUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    // Dashboard එකේ මුළු Layout එක. h-screen
    <div className="flex h-screen bg-slate-100 text-slate-900 antialiased">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        loggedInUser={loggedInUser}
      />

      {/* Mobile Overlay (Backdrop): Sidebar open නම් overlay එක පෙන්වන්න, Desktop වලදී සඟවන්න (md:hidden) */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-200"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* main content: h-full මගින් උස (height) නිවැරදිව පවත්වා ගනී */}
      <main className={`flex-1 flex flex-col h-full bg-white shadow-2xl shadow-slate-300/40 
                       overflow-hidden 
                       transition-all duration-300 ease-in-out border border-slate-200/80
                       min-w-0
                       
                       // Desktop/Tablet: Sidebar Open/Close මත margin එක පාලනය කිරීම
                       ${isSidebarOpen ? 'md:ml-80' : 'md:ml-20'} 
                       ml-0 rounded-none`}>

        <DashboardHeader
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          toggleSidebar={toggleSidebar} 
        />

        {/* මෙම div එක flex-1 සහ overflow-y-auto ලෙස සකසා ඇති නිසා, මෙයට ඇතුළත් වන content scroll වේ */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto rounded-br-none">
          <div className="p-4 md:p-6">
            {location.pathname === '/dashboard' ? <DashboardHome /> : <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;