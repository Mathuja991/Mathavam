import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  faCalendarCheck,
  faClipboardList,
  faHospital,
  faUsers,
  faHourglassHalf,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatCard from '../StatCard';
import QuickAction from '../QuickAction';

// --- Auth Token එක ලබාගන්නා Helper Function ---
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    return { headers: {} };
  }
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// --- අද දිනය "YYYY-MM-DD" format එකෙන් (Local Time) ලබාගැනීම ---
const getTodayLocalString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Appointment date එක (UTC වලින් ආවත්) Local "YYYY-MM-DD" format එකට හැරවීම ---
const getAppointmentLocalString = (dateString) => {
  if (!dateString) return null;
  const apptDate = new Date(dateString);
  const year = apptDate.getFullYear();
  const month = String(apptDate.getMonth() + 1).padStart(2, '0');
  const day = String(apptDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DashboardHome = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      const authConfig = getAuthConfig();

      if (!authConfig.headers['x-auth-token']) {
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const [patientRes, userRes, apptRes] = await Promise.all([
          axios.get('/api/patientRecords', authConfig),
          axios.get('/api/users', authConfig),
          axios.get('/api/appointments', authConfig),
        ]);

        // --- 1. Appointment දත්ත සැකසීම ---
        // (Date logic එක නිවැරදියි, ඔබගේ data තියෙන්නේ 22 වෙනිදාට)
        const allAppointments = apptRes.data.data || (Array.isArray(apptRes.data) ? apptRes.data : []);
        const today = getTodayLocalString(); // e.g., "2025-10-21"

        const todayAppointments = allAppointments.filter((appt) => {
          const apptDateString = getAppointmentLocalString(appt.appointmentDate); // e.g., "2025-10-22"
          return apptDateString === today;
        }).length;

        const pendingAppointments = allAppointments.filter(
          (appt) => appt.status === 'Pending'
        ).length; // (ඔබේ data අනුව 4 ක් පෙන්විය යුතුයි)

        // --- 2. (FIX) Total Counts ගණනය කිරීම ---
        // API response එක { data: [...] } හෝ [...] ආවොත් handle කිරීම
        
        const patientArray = patientRes.data.data || (Array.isArray(patientRes.data) ? patientRes.data : []);
        const totalPatients = patientArray.length; // (ඔබේ data අනුව 3 ක් පෙන්විය යුතුයි)

        const userArray = userRes.data.data || (Array.isArray(userRes.data) ? userRes.data : []);
        const totalUsers = userArray.length; // (ඔබේ data අනුව 5 ක් පෙන්විය යුතුයි)

        setStats({
          todayAppointments,
          pendingAppointments,
          totalPatients,
          totalUsers,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRecordingSheet = () => navigate('/dashboard/patient-records');
  const handleAppointmentManagement = () => navigate('/dashboard/appointments');
  const handleRDHS = () => navigate('/dashboard/rdhs');

  // Loading State
  if (loading) {
    return (
      <section className="p-4 md:p-6 flex justify-center items-center h-full min-h-[300px]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-blue-500"
        />
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="p-4 md:p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </section>
    );
  }

  // Success State
  return (
    <section className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={faCalendarCheck}
          title="Today's Appointments"
          value={stats.todayAppointments} // <-- අද දවසට (Oct 21) අගය 0 වේ. හෙට (Oct 22) දින බැලුවොත් 5 වේ.
          sub={
            stats.todayAppointments === 0
              ? 'No appointments today'
              : `Total for ${new Date().toLocaleDateString()}`
          }
        />
        <StatCard
          icon={faHourglassHalf}
          title="Pending Appointments"
          value={stats.pendingAppointments} // <-- ඔබගේ data අනුව 4 ක් පෙන්විය යුතුයි
          sub={
            stats.pendingAppointments > 0
              ? 'Needs confirmation'
              : 'All clear'
          }
        />
        <StatCard
          icon={faClipboardList}
          title="Total Patients"
          value={stats.totalPatients} // <-- (FIXED) ඔබගේ data අනුව 3 ක් පෙන්විය යුතුයි
          sub="All registered patients"
        />
        <StatCard
          icon={faUsers}
          title="Total Users"
          value={stats.totalUsers} // <-- (FIXED) ඔබගේ data අනුව 5 ක් පෙන්විය යුතුයි
          sub="Staff, Admins, and Parents"
        />
      </div>

      {/* --- Quick Actions (Static Links) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          title="Record New Patient"
          desc="Add demographics & intake"
          onClick={handleRecordingSheet}
          icon={faClipboardList}
        />
        <QuickAction
          title="Schedule Session"
          desc="Book a therapy appointment"
          onClick={handleAppointmentManagement}
          icon={faCalendarCheck}
        />
        <QuickAction
          title="Open RDHS"
          desc="Regional health dashboard"
          onClick={handleRDHS}
          icon={faHospital}
        />
      </div>
    </section>
  );
};

export default DashboardHome;