import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChild, faCalendarAlt, faQrcode, faBookReader, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

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

const ParentDashboardHome = ({ loggedInUser }) => {
  const mockStats = {
    childName: 'Your Child',
    nextAppointment: 'Tomorrow, 10:00 AM',
    qrCodeStatus: 'Active',
    resourcesAvailable: '12',
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-purple-700 border-b-4 border-purple-200/50 pb-3 mb-6">
        Welcome Parent! <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Child Name" value={mockStats.childName} icon={faChild} bgColor="bg-gradient-to-r from-purple-600 to-indigo-700" />
        <StatCard title="Next Appointment" value={mockStats.nextAppointment} icon={faCalendarAlt} bgColor="bg-gradient-to-r from-blue-600 to-sky-700" />
        <StatCard title="QR Code Status" value={mockStats.qrCodeStatus} icon={faQrcode} bgColor="bg-gradient-to-r from-green-600 to-teal-700" />
        <StatCard title="Available Resources" value={mockStats.resourcesAvailable} icon={faBookReader} bgColor="bg-gradient-to-r from-orange-500 to-amber-600" />
      </div>

      <div className="pt-4">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 border-b-2 border-purple-500/50 pb-2">
          Quick Access & Tools 🏡
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="View Child Info (Their child only)"
            desc="Access your child's demographic and intake details."
            icon={faChild}
            bgColor="bg-purple-600 hover:bg-purple-700 shadow-lg"
            onClick={() => console.log('Navigate to Child Info View')}
          />
          <QuickAction
            title="View Parental Resources"
            desc="Access reading materials and training guides."
            icon={faBookReader}
            bgColor="bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => console.log('Navigate to Parental Resources')}
          />
          <QuickAction
            title="Manage Appointments (CRUD)"
            desc="Book or manage your child's doctor/therapy appointments."
            icon={faCalendarAlt}
            bgColor="bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => console.log('Navigate to Appointments')}
          />
          <QuickAction
            title="SNAP Form"
            desc="View/Update your child's SNAP form data."
            icon={faShieldAlt}
            bgColor="bg-amber-500 hover:bg-amber-600 shadow-lg"
            onClick={() => console.log('Navigate to SNAP Form')}
          />
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardHome;