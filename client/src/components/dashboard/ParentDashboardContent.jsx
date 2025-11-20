import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faClipboardList, 
  faBrain, 
  faChild, 
  faNotesMedical, 
  faQrcode, 
  faLink,
} from '@fortawesome/free-solid-svg-icons';

import QuickAction from '../ui/QuickAction'; 

/**
 * Dashboard content for the Parent role.
 * @param {function} handleNavigation - Function to handle navigation (e.g., useNavigate hook from router).
 * @param {object} loggedInUser - The currently logged-in user object.
 */
const ParentDashboardContent = ({ handleNavigation, loggedInUser }) => {
  
  const handleViewDocs = useCallback(() => handleNavigation('/dashboard/viewdocs'), [handleNavigation]);
  
  const handleQrAttendance = useCallback(() => {
    const childNo = loggedInUser.childRegNo;
    if (childNo) {
      handleNavigation(`/dashboard/parent-view/${childNo}`); 
    } else {
      console.warn("Child Registration Number not found for QR attendance view.");
    }
  }, [handleNavigation, loggedInUser.childRegNo]);

  const handleSkillAssessment = useCallback(() => handleNavigation('/dashboard/forms'), [handleNavigation]);
  const handleRecordList = useCallback(() => handleNavigation('/dashboard/patient-records'), [handleNavigation]);
  const handleAppointmentManagement = useCallback(() => handleNavigation('/dashboard/appointments'), [handleNavigation]);

  return (
    <div className="p-4 md:p-8 flex flex-col h-full bg-white rounded-xl shadow-2xl">
      <header className="mb-8 border-b-2 border-blue-500/50 pb-4">
        <h1 className="text-4xl font-extrabold text-blue-800">
          Welcome, {loggedInUser.firstName}!
        </h1>
        <p className="text-xl text-blue-600 mt-2">
          Your Child: **{loggedInUser.childRegNo || 'N/A'}**
        </p>
      </header>

      <div className="flex-1 space-y-10">
        <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChild} className="text-blue-500" /> Child's Status
          </h2>
          <p className="text-lg text-gray-700">
            Keep track of your child's records, attendance, and important resources here.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Parent Quick Links <FontAwesomeIcon icon={faLink} className="text-2xl text-gray-500" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="View Attendance QR"
              desc={`Generate QR code for child: ${loggedInUser.childRegNo || 'N/A'}`}
              onClick={handleQrAttendance}
              icon={faQrcode}
              bgColor="bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-600 hover:to-violet-700 shadow-xl"
            />
            <QuickAction
              title="View Patient Records"
              desc="Access your child's recorded clinical records (read-only)."
              onClick={handleRecordList}
              icon={faNotesMedical}
              bgColor="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-xl"
            />
            <QuickAction
              title="View Resources"
              desc="Check new reading materials and guidelines from staff."
              onClick={handleViewDocs}
              icon={faClipboardList}
              bgColor="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl"
            />
            <QuickAction
              title="Request Appointment"
              desc="Book or view upcoming therapy sessions."
              onClick={handleAppointmentManagement}
              icon={faCalendarCheck}
              bgColor="bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 shadow-xl"
            />
            <QuickAction
              title="Skill Assessments"
              desc="View or start skill assessment forms."
              onClick={handleSkillAssessment}
              icon={faBrain}
              bgColor="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-xl"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParentDashboardContent;