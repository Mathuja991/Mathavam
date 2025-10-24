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

const getTodayLocalString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

        const allAppointments =
          apptRes.data.data || (Array.isArray(apptRes.data) ? apptRes.data : []);
        const today = getTodayLocalString();

        const todayAppointments = allAppointments.filter((appt) => {
          const apptDateString = getAppointmentLocalString(appt.appointmentDate);
          return apptDateString === today;
        }).length;

        const pendingAppointments = allAppointments.filter(
          (appt) => appt.status === 'Pending'
        ).length;

        const patientArray =
          patientRes.data.data ||
          (Array.isArray(patientRes.data) ? patientRes.data : []);
        const totalPatients = patientArray.length;

        const userArray =
          userRes.data.data || (Array.isArray(userRes.data) ? userRes.data : []);
        const totalUsers = userArray.length;

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

  if (loading) {
    return (
      // FIX: h-full සහ අනවශ්‍ය background classes ඉවත් කර ඇත.
      <section className="flex justify-center items-center min-h-[400px]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-indigo-600"
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto">
        <div
          className="bg-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-xl shadow-2xl text-center font-['Roboto',_sans-serif]"
          role="alert"
        >
          <p className="text-xl font-bold mb-2">Data Loading Error</p>
          <span className="block text-lg">{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10 font-['Roboto',_sans-serif]"> 
      <div className="flex justify-between items-center pb-4 border-b-4 border-indigo-100">
        <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight">
          System Overview 🚀
        </h1>
      </div>

      {/* --- Stats Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={faCalendarCheck}
          title="Today's Appointments"
          value={stats.todayAppointments}
          sub={
            stats.todayAppointments === 0
              ? 'No appointments today'
              : `Total for ${new Date().toLocaleDateString()}`
          }
          iconColor="text-teal-500"
          bgColor="bg-white hover:bg-teal-50 shadow-lg border-l-4 border-teal-500 transition-all duration-300"
        />
        <StatCard
          icon={faHourglassHalf}
          title="Pending Appointments"
          value={stats.pendingAppointments}
          sub={stats.pendingAppointments > 0 ? 'Needs confirmation' : 'All clear'}
          iconColor="text-yellow-500"
          bgColor="bg-white hover:bg-yellow-50 shadow-lg border-l-4 border-yellow-500 transition-all duration-300"
        />
        <StatCard
          icon={faClipboardList}
          title="Total Patients"
          value={stats.totalPatients}
          sub="All registered patients"
          iconColor="text-blue-500"
          bgColor="bg-white hover:bg-blue-50 shadow-lg border-l-4 border-blue-500 transition-all duration-300"
        />
        <StatCard
          icon={faUsers}
          title="Total Users"
          value={stats.totalUsers}
          sub="Staff, Admins, and Parents"
          iconColor="text-purple-500"
          bgColor="bg-white hover:bg-purple-50 shadow-lg border-l-4 border-purple-500 transition-all duration-300"
        />
      </div>

      {/* --- Quick Actions --- */}
      <div className="pt-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-500/50 pb-2">
          Quick Actions ⚡
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Record New Patient"
            desc="Add demographics & intake"
            onClick={handleRecordingSheet}
            icon={faClipboardList}
            bgColor="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl"
          />
          <QuickAction
            title="Schedule Session"
            desc="Book a therapy appointment"
            onClick={handleAppointmentManagement}
            icon={faCalendarCheck}
            bgColor="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl"
          />
          <QuickAction
            title="Open RDHS"
            desc="Regional health dashboard"
            onClick={handleRDHS}
            icon={faHospital}
            bgColor="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default DashboardHome;