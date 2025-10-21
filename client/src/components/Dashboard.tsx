import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Import newly created components
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardHome from './dashboard/DashboardHome';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null); // State for logged-in user data
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // --- Effect to load user from localStorage ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        handleLogout(); // Log out if data is corrupted
      }
    } else {
      // If no user data, redirect to login
      navigate('/');
    }
  }, [navigate]); // Dependency on navigate

  // --- Keyboard shortcut effect ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typingInField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.key === '[' && !typingInField) {
        e.preventDefault();
        setIsSidebarOpen((s) => !s);
      }
      if (e.key === '/' && !typingInField) {
        e.preventDefault();
        (searchRef.current as HTMLInputElement)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // --- Actions ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedInUser(null);
    navigate('/');
  };

  // --- New function to update user state from modal ---
  const handleUserUpdate = (updatedUser: any) => {
    setLoggedInUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 antialiased overflow-hidden">
      {/* Sidebar Component */}
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        loggedInUser={loggedInUser}
      />

      <main className="flex-1 flex flex-col bg-white rounded-l-3xl shadow-sm overflow-hidden my-4 ml-4 transition-all duration-300 ease-in-out border border-gray-100">
        {/* Header Component */}
        <DashboardHeader
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          onUserUpdate={handleUserUpdate} // Pass the update handler
        />

        {/* Dashboard Home-specific content (Stat cards, etc.) */}
        {location.pathname === '/dashboard' && <DashboardHome />}

        {/* Outlet for nested routes */}
        <div className="flex-1 bg-gray-100 overflow-y-auto rounded-br-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;