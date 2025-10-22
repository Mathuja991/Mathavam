import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentManagement = () => {
  const [selectedType, setSelectedType] = useState('');
  const [currentUserType, setCurrentUserType] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.userType) {
      setCurrentUserType(user.userType);
      setCurrentUserId(user.id); 
    }
  }, []);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    switch (type) {
      case 'session':
        navigate('/dashboard/appointments/session-booking');
        break;
      case 'service':
        navigate('/dashboard/appointments/service-booking');
        break;
      case 'doctor':
        navigate('/dashboard/appointments/doctor-booking');
        break;
      case 'my-schedule':
        navigate('/dashboard/appointments/my-schedule');
        break;
      case 'all-appointments':
        navigate('/dashboard/appointments/all');
        break;
      default:
        break;
    }
  };

  const isPractitioner = currentUserType === 'Doctor' || currentUserType === 'Therapist';
  const isAdmin = currentUserType === 'Admin' || currentUserType === 'Super Admin';
  const isParent = currentUserType === 'Parent';
  const isResourcePerson = currentUserType === 'Resource Person';

  return (
    <div className="container mx-auto p-8 bg-gradient-to-r from-indigo-100 to-blue-200 rounded-xl shadow-xl">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Appointment Management</h2>

      {/* Quick Access for Practitioners */}
      {isPractitioner && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-md flex justify-between items-center transition duration-300 ease-in-out hover:shadow-2xl">
          <p className="text-blue-800 text-lg font-medium">Quickly view your upcoming appointments:</p>
          <button
            onClick={() => navigate('/dashboard/appointments/my-schedule')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-all"
          >
            <i className="fas fa-calendar-check mr-2"></i> View My Schedule
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Doctor Appointment Card (for Parents/Admins) */}
        {(isParent || isAdmin) && (
          <div
            className={`bg-gradient-to-r from-purple-50 to-purple-100 border-2 ${
              selectedType === 'doctor' ? 'border-purple-600' : 'border-purple-200'
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
            onClick={() => handleTypeSelect('doctor')}
          >
            <div className="text-5xl mb-4 text-purple-700">
              <i className="fas fa-user-md"></i>
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Book Doctor Appointment</h3>
            <p className="text-gray-600 text-center">Schedule appointments with doctors.</p>
          </div>
        )}

        {/* Service Booking Card (for Parents/Admins/Therapists) */}
        {(isParent || isAdmin || isPractitioner) && (
          <div
            className={`bg-gradient-to-r from-green-50 to-green-100 border-2 ${
              selectedType === 'service' ? 'border-green-600' : 'border-green-200'
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
            onClick={() => handleTypeSelect('service')}
          >
            <div className="text-5xl mb-4 text-green-700">
              <i className="fas fa-briefcase-medical"></i>
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Book Service Appointment</h3>
            <p className="text-gray-600 text-center">Schedule appointments for various therapy services.</p>
          </div>
        )}

        {/* Session Booking Card (Re-enabled and updated) - for Parents, Admins, Resource Person, Practitioners */}
        {(isParent || isAdmin || isResourcePerson || isPractitioner) && (
          <div
            className={`bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 ${
              selectedType === 'session' ? 'border-indigo-600' : 'border-indigo-200'
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
            onClick={() => handleTypeSelect('session')}
          >
            <div className="text-5xl mb-4 text-indigo-700">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Book Session</h3>
            <p className="text-gray-600 text-center">Schedule group or specific topic sessions.</p>
          </div>
        )}

        {/* Practitioner's Personal Schedule (for Doctors/Therapists) */}
        {isPractitioner && (
          <div
            className={`bg-gradient-to-r from-blue-50 to-blue-100 border-2 ${
              selectedType === 'my-schedule' ? 'border-blue-600' : 'border-blue-200'
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
            onClick={() => handleTypeSelect('my-schedule')}
          >
            <div className="text-5xl mb-4 text-blue-700">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">My Schedule</h3>
            <p className="text-gray-600 text-center">View and manage your upcoming appointments.</p>
          </div>
        )}

        {/* Admin/Super Admin All Appointments View (for Admins) */}
        {isAdmin && (
          <div
            className={`bg-gradient-to-r from-orange-50 to-orange-100 border-2 ${
              selectedType === 'all-appointments' ? 'border-orange-600' : 'border-orange-200'
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
            onClick={() => handleTypeSelect('all-appointments')}
          >
            <div className="text-5xl mb-4 text-orange-700">
              <i className="fas fa-list-alt"></i>
            </div>
            <h3 className="text-xl font-semibold text-orange-800 mb-2">View All Appointments</h3>
            <p className="text-gray-600 text-center">Oversee and manage all system appointments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;
