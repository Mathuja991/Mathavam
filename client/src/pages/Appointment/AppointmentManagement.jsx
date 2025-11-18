import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaCalendarCheck, 
    FaUsers, 
    FaUserMd, 
    FaHandHoldingMedical, 
    FaListAlt 
} from 'react-icons/fa'; // Importing Font Awesome icons as React components

const AppointmentManagement = () => {
    const [selectedType, setSelectedType] = useState('');
    const [currentUserType, setCurrentUserType] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from localStorage and set state
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.userType) {
            setCurrentUserType(user.userType);
            setCurrentUserId(user.id); 
        }
    }, []); // Runs once on component mount.

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
            // 'all-appointments' case has been removed as per the previous request.
            case 'manage-availability':
                navigate('/dashboard/appointments/manage-availability');
                break;
            default:
                break;
        }
    };

    // --- 3. User Type Check ---
    const isPractitioner = ['Doctor', 'Therapist'].includes(currentUserType);
    const isDoctor = ['Doctor'].includes(currentUserType);
    const isTherapist = ['Therapist'].includes(currentUserType);
    const isAdmin = ['Admin', 'Super Admin'].includes(currentUserType);
    const isParent = currentUserType === 'Parent';
    const isResourcePerson = currentUserType === 'Resource Person';

    // --- 4. Card Component for Reusability and Styling ---
    // icon: This prop now receives the React Icon Component (e.g., FaUsers)
    const AppointmentCard = ({ type, icon: IconComponent, title, description, allowed }) => {
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
                bg: 'from-purple-100 to-indigo-200',
                border: selectedType === 'my-schedule' ? 'border-indigo-600 ring-4 ring-indigo-300' : 'border-indigo-300',
                text: 'text-indigo-800',
                icon: 'text-indigo-600',
            },
            'manage-availability': {
                bg: 'from-yellow-100 to-amber-200',
                border: selectedType === 'manage-availability' ? 'border-amber-600 ring-4 ring-amber-300' : 'border-amber-300',
                text: 'text-amber-800',
                icon: 'text-amber-600',
            },
        };

        const currentTheme = colorClasses[type] || colorClasses.Default;

        return (
            <div
                onClick={() => handleTypeSelect(type)}
                className={`bg-gradient-to-br ${currentTheme.bg} p-6 rounded-2xl shadow-xl cursor-pointer transform transition duration-300 ease-in-out hover:scale-[1.02] border-2 ${currentTheme.border}`}
            >
                <div className={`flex items-center space-x-4 ${currentTheme.text}`}>
                    {/* Render the passed React Icon Component */}
                    <IconComponent className={`text-3xl ${currentTheme.icon}`} /> 
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <p className={`mt-3 text-sm ${currentTheme.text} opacity-80`}>
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
                Appointment Hub
            </h2>

            {/* Quick Access for Practitioners */}
            {isPractitioner && (
                <div className="mb-10 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-inner border border-purple-200">
                    <h3 className="text-xl font-bold text-indigo-800 mb-3">
                        Practitioner Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AppointmentCard
                            type="my-schedule"
                            icon={FaCalendarCheck} // Icon component passed as prop
                            title="My Work Schedule"
                            description="View and manage your upcoming schedule and availability."
                            allowed={isPractitioner}
                        />
                        <AppointmentCard
                            type="doctor"
                            icon={FaUsers} // Icon component passed as prop
                            title="Patient Appointments"
                            description="View and manage appointments booked by patients."
                            allowed={isPractitioner}
                        />
                    </div>
                </div>
            )}

            {/* Main Appointment Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Book Appointment Card */}
                <AppointmentCard
                    type="book"
                    icon={FaUserMd} // Icon component passed as prop
                    title="Book Session"
                    description="Schedule a doctor's consultation or general session."
                    allowed={isParent}
                />

                {/* Service Booking Card */}
                <AppointmentCard
                    type="service"
                    icon={FaHandHoldingMedical} // Icon component passed as prop
                    title="Therapy / Service"
                    description="Schedule appointments for various therapy and support services."
                    allowed={isParent || isAdmin || isPractitioner}
                />

                {/* Patient Appointments Card (For Admin/Resource Person) - Note: Type 'doctor' used for route consistency */}
                <AppointmentCard
                    type="doctor"
                    icon={FaUsers} // Icon component passed as prop
                    title="Patient Appoinments"
                    description="View and manage appointments booked by patients (used for group/workshop scheduling)."
                    allowed={ isDoctor}
                />

                {/* Admin Manage Availability View */}
                <AppointmentCard
                    type="manage-availability"
                    icon={FaListAlt} // Icon component passed as prop
                    title="Manage Availability"
                    description="Oversee, filter, and manage all system appointments and bookings."
                    allowed={isAdmin}
                />
            </div>
        </div>
    );
};

export default AppointmentManagement;