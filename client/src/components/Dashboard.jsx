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

    const handleInitialSidebarState = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleInitialSidebarState(); 
  }, [navigate]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  if (!loggedInUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        Loading User Data...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        loggedInUser={loggedInUser}
      />

      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-200"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

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

        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {location.pathname === '/dashboard' ? (
            <DashboardHome loggedInUser={loggedInUser} /> 
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;