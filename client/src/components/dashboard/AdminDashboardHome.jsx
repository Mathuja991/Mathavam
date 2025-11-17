// AdminDashboardHome.jsx Update
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faCalendarAlt, faChartLine, faUsers, faFileInvoiceDollar, faSpinner } from '@fortawesome/free-solid-svg-icons';
// දැනට Backend එකේ URL එක නොමැති නිසා, මෙය ඔබගේ .env එකේ ඇති URL එකට වෙනස් කරන්න.
const API_BASE_URL = 'http://localhost:5000/'; // <--- ඔබගේ Backend Base URL එක යොදන්න.

// Simple card component
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300 ${bgColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-white opacity-80 uppercase tracking-wider">{title}</h3>
        {/* දත්ත Loading වන විට Spinner එකක් පෙන්වීමට */}
        <p className="text-3xl font-bold text-white mt-1">
          {value === undefined ? <FontAwesomeIcon icon={faSpinner} spin /> : value}
        </p>
      </div>
      <FontAwesomeIcon icon={icon} className="text-white text-4xl opacity-50" />
    </div>
  </div>
);

const QuickAction = ({ title, desc, icon, bgColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-6 rounded-xl text-left transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${bgColor} text-white`}
  >
    <FontAwesomeIcon icon={icon} className="text-3xl mb-3" />
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-sm opacity-90 mt-1">{desc}</p>
  </button>
);

const AdminDashboardHome = ({ loggedInUser }) => {
  // 1. Initial State එක සකස් කිරීම. (Initial value එක undefined ලෙස තබා Loading තත්ත්වය පෙන්වීමට)
  const [stats, setStats] = useState({
    totalChildren: undefined,
    totalStaff: undefined,
    todayAppointments: undefined,
    monthlyReturnsStatus: undefined,
  });

  // 2. දත්ත ලබා ගැනීම සඳහා useEffect භාවිතා කිරීම.
  useEffect(() => {
    const fetchDashboardStats = async () => {
      // මෙහිදී 'token' එක localStorage එකෙන් හෝ Context එකෙන් ලබාගත යුතුය.
      const token = localStorage.getItem('token'); 
      if (!token) {
        console.error('No authorization token found.');
        return;
      }
      
      try {
        // ඔබගේ Backend එකේ තිබිය යුතු නව API Route එක: /api/dashboard/stats
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Auth Middleware එක භාවිතා කරන්නේ නම්
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 3. ලබාගත් දත්ත State එකට යාවත්කාලීන කිරීම.
        setStats({
          totalChildren: data.totalChildren || 'N/A',
          totalStaff: data.totalStaff || 'N/A',
          todayAppointments: data.todayAppointments || 'N/A',
          monthlyReturnsStatus: data.monthlyReturnsStatus || 'Pending',
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // දත්ත ලබාගැනීම අසාර්ථක වුවහොත් පණිවිඩයක් පෙන්වීම.
        setStats({
          totalChildren: 'Error',
          totalStaff: 'Error',
          todayAppointments: 'Error',
          monthlyReturnsStatus: 'Error',
        });
      }
    };

    fetchDashboardStats();
  }, []); // හිස් array එකක් දීමෙන් component mount වූ පසු එක් වරක් පමණක් run වේ.


  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-teal-700 border-b-4 border-teal-200/50 pb-3 mb-6">
        Admin Management Portal <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      {/* Stats Cards - Backend එකෙන් ලැබෙන stats භාවිතා කරයි */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Children" 
          value={stats.totalChildren} // <--- State එකෙන් දත්ත ලබා ගැනීම
          icon={faUsers} 
          bgColor="bg-gradient-to-r from-teal-600 to-cyan-700" 
        />
        {/* Today's Appointments: Red/Pink -> Orange/Amber */}
        <StatCard 
          title="Today's Appointments" 
          value={stats.todayAppointments} // <--- State එකෙන් දත්ත ලබා ගැනීම
          icon={faCalendarAlt} 
          bgColor="bg-gradient-to-r from-amber-500 to-orange-600" 
        />
        <StatCard 
          title="Total Staff" 
          value={stats.totalStaff} // <--- State එකෙන් දත්ත ලබා ගැනීම
          icon={faUserShield} 
          bgColor="bg-gradient-to-r from-blue-600 to-indigo-700" 
        />
        <StatCard 
          title="Monthly Returns Status" 
          value={stats.monthlyReturnsStatus} // <--- State එකෙන් දත්ත ලබා ගැනීම
          icon={faFileInvoiceDollar} 
          bgColor="bg-gradient-to-r from-purple-500 to-fuchsia-600" 
        />
      </div>

      {/* Quick Actions (මෙහි වෙනසක් නැත, නුමුත් onClick වලට navigation logic එක එකතු කළ යුතුය) */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-teal-700 mb-6 border-b-2 border-teal-500/50 pb-2">
          Key Operations 🔑
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Appointments: Red -> Purple */}
          <QuickAction
            title="Manage All Appointments (CRUD)"
            desc="Schedule, reschedule, and manage therapy and doctor appointments."
            icon={faCalendarAlt}
            bgColor="bg-purple-600 hover:bg-purple-700 shadow-lg"
            onClick={() => console.log('Navigate to Appointment Management')} // <--- Use navigate() here
          />
          <QuickAction
            title="View All Child Info"
            desc="Access all child demographic and intake data."
            icon={faUsers}
            bgColor="bg-teal-600 hover:bg-teal-700 shadow-lg"
            onClick={() => console.log('Navigate to Child Info View')} // <--- Use navigate() here
          />
          <QuickAction
            title="Review Flowcharts (CRUD)"
            desc="Create or review existing child therapy flowcharts."
            icon={faChartLine}
            bgColor="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            onClick={() => console.log('Navigate to Flowchart Management')} // <--- Use navigate() here
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;