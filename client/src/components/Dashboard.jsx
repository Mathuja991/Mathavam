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
  }, [navigate]);

  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const typingInField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.key === '[' && !typingInField) {
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
    // --- STYLE UPDATE: Changed background to a softer slate color ---
    <div className="flex h-screen bg-slate-100 text-slate-900 antialiased">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        loggedInUser={loggedInUser}
      />

      {/* --- STYLE UPDATE: Enhanced shadow and border for a 'floating' panel effect --- */}
      <main className="flex-1 flex flex-col bg-white rounded-l-3xl shadow-2xl shadow-slate-300/40 
                       overflow-hidden my-3 ml-3 transition-all duration-300 ease-in-out border border-slate-200/80">
        <DashboardHeader
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />

        {location.pathname === '/dashboard' && <DashboardHome />}

        {/* --- STYLE UPDATE: Changed background color to match the main bg --- */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto rounded-br-3xl">
          {/* --- STYLE UPDATE: Added padding to the outlet container --- */}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;