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
  }, []); // Empty dependency array ensures this runs once on mount.

  // --- 2. Navigation Logic ---
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    switch (type) {
      case 'doctor':
        navigate('/dashboard/appointments/patient-appointments');
        break;
      case 'service':
        navigate('/dashboard/appointments/service-booking');
        break;
      case 'book':
        navigate('/dashboard/appointments/book-appointment');
        break;
      case 'my-schedule':
        navigate('/dashboard/appointments/my-schedule');
        break;
      case 'all-appointments':
        navigate('/dashboard/appointments/all');
        break;
        case 'manage-availability':
        navigate('/dashboard/appointments/manage-availability');
        break;
      default:
        break;
    }
  };

  // --- 3. User Type Check ---
  const isPractitioner = ['Doctor', 'Therapist'].includes(currentUserType);
  const isAdmin = ['Admin', 'Super Admin'].includes(currentUserType);
  const isParent = currentUserType === 'Parent';
  const isResourcePerson = currentUserType === 'Resource Person';

  // --- 4. Card Component for Reusability and Styling ---
  const AppointmentCard = ({ type, icon, title, description, allowed }) => {
    if (!allowed) return null;

    // Define Color Theme based on type
    const colorClasses = {
      book: {
        bg: 'from-pink-100 to-rose-200',
        border: selectedType === 'book' ? 'border-rose-600 ring-4 ring-rose-300' : 'border-rose-300',
        text: 'text-rose-700',
        icon: 'text-rose-600',
      },
      service: {
        bg: 'from-emerald-100 to-teal-200',
        border: selectedType === 'service' ? 'border-teal-600 ring-4 ring-teal-300' : 'border-teal-300',
        text: 'text-teal-800',
        icon: 'text-teal-600',
      },
      doctor: {
        bg: 'from-blue-100 to-sky-200',
        border: selectedType === 'session' ? 'border-sky-600 ring-4 ring-sky-300' : 'border-sky-300',
        text: 'text-sky-800',
        icon: 'text-sky-600',
      },
      'my-schedule': {
        bg: 'from-indigo-100 to-violet-200',
        border: selectedType === 'my-schedule' ? 'border-violet-600 ring-4 ring-violet-300' : 'border-violet-300',
        text: 'text-violet-800',
        icon: 'text-violet-600',
      },
      'all-appointments': {
        bg: 'from-amber-100 to-yellow-200',
        border: selectedType === 'all-appointments' ? 'border-yellow-600 ring-4 ring-yellow-300' : 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
      },
      'manage-availability': {
        bg: 'from-green-100 to-green-200',
        border: selectedType === 'manage-availability' ? 'border-green-600 ring-4 ring-green-300' : 'border-green-300',
        text: 'text-green-800',
        icon: 'text-green-600',
      },
    };

    const colors = colorClasses[type] || {};

    return (
      <div
        className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer 
          hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 ease-in-out transform`}
        onClick={() => handleTypeSelect(type)}
      >
        {/* Icon Area */}
        <div className={`text-6xl mb-5 ${colors.icon} drop-shadow-md`}>
          <i className={icon}></i>
        </div>
        {/* Title */}
        <h3 className={`text-2xl font-extrabold ${colors.text} mb-2 text-center`}>
          {title}
        </h3>
        {/* Description */}
        <p className="text-gray-600 text-center font-medium">
          {description}
        </p>
      </div>
    );
  };

  // --- 5. Render Logic ---
  return (
    <div className="container mx-auto p-10 max-w-6xl bg-white rounded-3xl shadow-2xl font-['Inter',_sans-serif] min-h-[80vh]">
      {/* Header: Bold title and separation line */}
      <h2 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 mb-10 text-center tracking-tight border-b-4 border-indigo-200 pb-4">
        📅 Appointment Hub
      </h2>

      {/* Quick Access for Practitioners */}
      {isPractitioner && (
        <div className="mb-10 p-5 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center transition duration-300 ease-in-out hover:shadow-indigo-400/50">
          <p className="text-white text-lg font-semibold mb-3 sm:mb-0">
            View your personalized schedule & manage appointments.
          </p>
          <button
            onClick={() => navigate('/dashboard/appointments/my-schedule')}
            className="inline-flex items-center px-6 py-2 bg-white text-indigo-700 font-bold rounded-xl shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            <i className="fas fa-calendar-alt mr-2"></i> Go to My Schedule
          </button>
        </div>
      )}

      {/* Appointment Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Doctor Appointment Card */}
        <AppointmentCard
          type="book"
          icon="fas fa-user-md"
          title="Book Doctor Appointment"
          description="Schedule consultations with medical doctors or specialists."
          allowed={isParent}
        />

        {/* Service Booking Card */}
        <AppointmentCard
          type="service"
          icon="fas fa-briefcase-medical"
          title="Book Therapy / Service"
          description="Schedule appointments for various therapy and support services."
          allowed={isParent || isAdmin || isPractitioner}
        />

        {/* Session Booking Card */}
        <AppointmentCard
          type="doctor"
          icon="fas fa-users"
          title="Patient Appoinments"
          description="Appointment Overview & Patient Information"
          allowed={isPractitioner }
        />

        {/* Practitioner's Personal Schedule */}
        <AppointmentCard
          type="my-schedule"
          icon="fas fa-calendar-check"
          title="My Work Schedule"
          description="View and manage your upcoming schedule and availability."
          allowed={isPractitioner}
        />

        {/* Admin All Appointments View */}
        <AppointmentCard
          type="all-appointments"
          icon="fas fa-list-alt"
          title="All Appointments"
          description="Oversee, filter, and manage all system appointments and bookings."
          allowed={isAdmin}
        />
        <AppointmentCard
          type="manage-availability"
          icon="fas fa-list-alt"
          title="Manage Availability of Doctors and Manage Appointments"
          description="Oversee, filter, and manage all system appointments and bookings."
          allowed={isAdmin}
        />
      </div>
    </div>
  );
};

export default AppointmentManagement;

