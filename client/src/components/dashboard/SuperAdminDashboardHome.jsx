import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faUsersCog, faChartBar, faFileInvoiceDollar, faBook } from '@fortawesome/free-solid-svg-icons';

// Simple card component for visual consistency
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


const SuperAdminDashboardHome = ({ loggedInUser }) => {
  // Mock data - replace with actual API calls in a real application
  const mockStats = {
    totalUsers: '120',
    totalAdmins: '5',
    monthlyReturnsPending: '2',
    totalChildren: '85',
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-indigo-800 border-b-4 border-indigo-200/50 pb-3 mb-6">
        Super Admin Portal <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={mockStats.totalUsers} icon={faUsersCog} bgColor="bg-gradient-to-r from-blue-600 to-blue-800" />
        <StatCard title="Total Children Records" value={mockStats.totalChildren} icon={faBook} bgColor="bg-gradient-to-r from-emerald-600 to-green-700" />
        <StatCard title="Pending Monthly Returns" value={mockStats.monthlyReturnsPending} icon={faFileInvoiceDollar} bgColor="bg-gradient-to-r from-amber-600 to-orange-700" />
        <StatCard title="System Health" value="Excellent" icon={faChartBar} bgColor="bg-gradient-to-r from-purple-600 to-pink-700" />
      </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-500/50 pb-2">
          System Management 🛠️
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Manage All Users (CRUD)"
            desc="Add, edit, and delete system users."
            icon={faUsersCog}
            bgColor="bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => console.log('Navigate to Manage Users')}
          />
          <QuickAction
            title="Manage All Child Records (CRUD)"
            desc="View, update, and create patient records."
            icon={faBook}
            bgColor="bg-emerald-600 hover:bg-emerald-700 shadow-lg"
            onClick={() => console.log('Navigate to Child Records')}
          />
          <QuickAction
            title="View Monthly Returns (CRUD)"
            desc="Review and manage monthly system reports."
            icon={faFileInvoiceDollar}
            bgColor="bg-amber-600 hover:bg-amber-700 shadow-lg"
            onClick={() => console.log('Navigate to Monthly Returns')}
          />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardHome;