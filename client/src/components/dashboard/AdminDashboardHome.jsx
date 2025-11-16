import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faCalendarAlt, faChartLine, faUsers, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

// Simple card component
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300 ${bgColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-white opacity-80 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
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
  // Mock data
  const mockStats = {
    totalChildren: '85',
    totalStaff: '15',
    todayAppointments: '8',
    monthlyReturnsStatus: 'Ready',
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-teal-700 border-b-4 border-teal-200/50 pb-3 mb-6">
        Admin Management Portal <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Children" value={mockStats.totalChildren} icon={faUsers} bgColor="bg-gradient-to-r from-teal-600 to-cyan-700" />
        <StatCard title="Today's Appointments" value={mockStats.todayAppointments} icon={faCalendarAlt} bgColor="bg-gradient-to-r from-red-500 to-pink-600" />
        <StatCard title="Total Staff" value={mockStats.totalStaff} icon={faUserShield} bgColor="bg-gradient-to-r from-blue-600 to-indigo-700" />
        <StatCard title="Monthly Returns Status" value={mockStats.monthlyReturnsStatus} icon={faFileInvoiceDollar} bgColor="bg-gradient-to-r from-purple-500 to-fuchsia-600" />
      </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-teal-700 mb-6 border-b-2 border-teal-500/50 pb-2">
          Key Operations 🔑
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Manage All Appointments (CRUD)"
            desc="Schedule, reschedule, and manage therapy and doctor appointments."
            icon={faCalendarAlt}
            bgColor="bg-red-500 hover:bg-red-600 shadow-lg"
            onClick={() => console.log('Navigate to Appointment Management')}
          />
          <QuickAction
            title="View All Child Info"
            desc="Access all child demographic and intake data."
            icon={faUsers}
            bgColor="bg-teal-600 hover:bg-teal-700 shadow-lg"
            onClick={() => console.log('Navigate to Child Info View')}
          />
          <QuickAction
            title="Review Flowcharts (CRUD)"
            desc="Create or review existing child therapy flowcharts."
            icon={faChartLine}
            bgColor="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            onClick={() => console.log('Navigate to Flowchart Management')}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;