import React from 'react';
import {
  faCalendarCheck,
  faHeartbeat,
  faClipboardList,
  faChartLine,
  faHospital,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../StatCard';
import QuickAction from '../QuickAction';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();

  // --- Handlers for QuickActions ---
  const handleRecordingSheet = () => navigate('/dashboard/patient-records');
  const handleAppointmentManagement = () => navigate('/dashboard/appointments');
  const handleRDHS = () => navigate('/dashboard/rdhs');

  return (
    <section className="p-5 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={faCalendarCheck}
          title="Today’s Appointments"
          value="12"
          sub="3 awaiting confirmation"
        />
        <StatCard
          icon={faHeartbeat}
          title="Active Therapies"
          value="28"
          sub="6 sessions in progress"
        />
        <StatCard
          icon={faClipboardList}
          title="New Registrations"
          value="5"
          sub="Since 9:00 AM"
        />
        <StatCard
          icon={faChartLine}
          title="Utilization"
          value="82%"
          sub="This week"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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