import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faFileMedical, faCalendarCheck, faClipboardList, faSyringe } from '@fortawesome/free-solid-svg-icons';

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

const DoctorDashboardHome = ({ loggedInUser }) => {
  // Mock data
  const mockStats = {
    newCARS: '3',
    upcomingAppointments: '5',
    totalPatients: '45',
    RDHSAccess: 'Yes',
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-blue-800 border-b-4 border-blue-200/50 pb-3 mb-6">
        Doctor's Consultation Panel <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CARS Assessment card: Red/Pink -> Purple/Indigo */}
        <StatCard title="New CARS Assessments (CRUD)" value={mockStats.newCARS} icon={faSyringe} bgColor="bg-gradient-to-r from-purple-600 to-indigo-700" />
        <StatCard title="Upcoming Appointments (CRUD)" value={mockStats.upcomingAppointments} icon={faCalendarCheck} bgColor="bg-gradient-to-r from-blue-600 to-indigo-700" />
        <StatCard title="Total Patients" value={mockStats.totalPatients} icon={faClipboardList} bgColor="bg-gradient-to-r from-green-600 to-teal-700" />
        <StatCard title="RDHS Access" value={mockStats.RDHSAccess} icon={faFileMedical} bgColor="bg-gradient-to-r from-pink-600 to-fuchsia-700" />
      </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-500/50 pb-2">
          Clinical Tools ⚕️
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CARS Form: Red -> Orange */}
          <QuickAction
            title="Manage CARS Form (CRUD)"
            desc="Create, Read, Update, Delete Childhood Autism Rating Scale forms."
            icon={faSyringe}
            bgColor="bg-orange-500 hover:bg-orange-600 shadow-lg"
            onClick={() => console.log('Navigate to CARS Form')}
          />
          <QuickAction
            title="Manage DSM-5 Form (CRUD)"
            desc="Create, Read, Update, Delete DSM-5 assessment forms."
            icon={faFileMedical}
            bgColor="bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => console.log('Navigate to DSM-5 Form')}
          />
          <QuickAction
            title="Manage SNAP Form (CRUD)"
            desc="Create, Read, Update, Delete SNAP forms."
            icon={faClipboardList}
            bgColor="bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => console.log('Navigate to SNAP Form')}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardHome;