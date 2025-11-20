import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsHelping, faCalendarAlt, faCommentDots, faPuzzlePiece, faRunning } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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

const TherapistDashboardHome = ({ loggedInUser }) => {
  const navigate = useNavigate();
  const mockStats = {
    speechPending: '4',
    sensoryPending: '6',
    sessionsToday: '7',
    activeTherapyPlans: '22',
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-green-700 border-b-4 border-green-200/50 pb-3 mb-6">
        Therapy Management Console <span className="text-2xl text-gray-500">({loggedInUser?.userType})</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Speech Forms Pending (S - CRUD)" value={mockStats.speechPending} icon={faCommentDots} bgColor="bg-gradient-to-r from-blue-600 to-sky-700" />
        <StatCard title="Sensory Profiles Pending (O, P - CRUD)" value={mockStats.sensoryPending} icon={faPuzzlePiece} bgColor="bg-gradient-to-r from-amber-600 to-orange-700" />
        <StatCard title="Therapy Sessions Today" value={mockStats.sessionsToday} icon={faCalendarAlt} bgColor="bg-gradient-to-r from-purple-600 to-indigo-700" />
        <StatCard title="Active Behavioural Plans" value={mockStats.activeTherapyPlans} icon={faRunning} bgColor="bg-gradient-to-r from-green-600 to-teal-700" />
      </div>

      <div className="pt-4">
        <h2 className="text-3xl font-bold text-green-700 mb-6 border-b-2 border-green-500/50 pb-2">
          Therapy & Assessment Tools 📋
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Speech Assessment Forms"
            desc="Create or update Speech Assessment records."
            icon={faCommentDots}
            bgColor="bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => navigate('/dashboard/skill-assessment')}
          />
          <QuickAction
            title="Sensory Profile Forms"
            desc="Manage Observational (O) and Parent (P) Sensory Profiles."
            icon={faPuzzlePiece}
            bgColor="bg-amber-600 hover:bg-amber-700 shadow-lg"
            onClick={() => navigate('/dashboard/sensory-profile-sections')}
          />
          <QuickAction
            title="Behavioural Checklist"
            desc="Create and update child Behavioural Checklists."
            icon={faRunning}
            bgColor="bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => navigate('/dashboard/forms/behavioral-checklist')}
          />
          <QuickAction
            title="All Assessment Forms"
            desc="Browse the full assessment forms catalog."
            icon={faHandsHelping}
            bgColor="bg-slate-700 hover:bg-slate-800 shadow-lg"
            onClick={() => navigate('/dashboard/forms')}
          />
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboardHome;
