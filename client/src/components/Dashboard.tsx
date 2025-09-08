import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faCog,
  faSignOutAlt,
  faUsers,
  faHome,
  faSearch,
  faNotesMedical,
  faUserGraduate,
  faQrcode,
  faHeartbeat,
  faClipboardList,
  faCalendarCheck,
  faChartLine,
  faChartBar,
  faHospital,
} from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import NavItem and SectionLabel components
import NavItem from "./NavItem";
import SectionLabel from "./SectionLabel";
import IconButton from "./IconButton";
import StatCard from "./StatCard";
import QuickAction from "./QuickAction";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // ---------- Effects ----------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        handleLogout();
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const typingInField =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "[" && !typingInField) {
        e.preventDefault();
        setIsSidebarOpen((s) => !s);
      }
      if (e.key === "/" && !typingInField) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!showAccountDropdown) return;
    const handler = (e) => {
      if (
        !e.target.closest("#account-dropdown-btn") &&
        !e.target.closest("#account-dropdown-menu")
      ) {
        setShowAccountDropdown(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [showAccountDropdown]);

  // ---------- Actions ----------
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleHome = () => navigate("/dashboard");
  const handleSkillAssessmentForms = () => navigate("/dashboard/forms");
  const handleRecordingSheet = () => navigate("/dashboard/patient-records");
  const handleAppointmentManagement = () => navigate("/dashboard/appointments");
  const handleParentalTraining = () => navigate("/dashboard/parental-training");
  const handleQRAttendance = () => navigate("/dashboard/qr-attendance");
  const handleTherapyTracking = () => navigate("/dashboard/therapy-tracking");
  const handleDocuments = () => navigate("/dashboard/documents");
  const handleTherapySessions = () => navigate("/dashboard/therapy-sessions");
  const handleReports = () => navigate("/dashboard/reports");
  const handleManageUsers = () => navigate("/dashboard/manage-users");
  const handleAddNewUser = () => navigate("manage-users/add");
  const handleRDHS = () => navigate("/dashboard/rdhs");
  const handleParentsReadingResources = () =>
    navigate("/dashboard/adminuploaddocs");
  const handleMonthlyReturns = () => navigate("/dashboard/forms/monreturn");
  const handleViewofParentsReadingResources = () =>
    navigate("/dashboard/viewdocs");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    navigate("/");
  };

  // ---------- Helpers ----------
  const isActive = (path) => {
    if (path === "/dashboard/skill-assessment") {
      return (
        location.pathname === "/dashboard/skill-assessment" ||
        location.pathname === "/dashboard/prerequisite-skill" ||
        location.pathname === "/dashboard/communication" ||
        location.pathname === "/dashboard/language" ||
        location.pathname === "/dashboard/speech" ||
        location.pathname === "/dashboard/oralmotor-assessment"
      );
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const currentTitle = (() => {
    const p = location.pathname;
    if (p === "/dashboard") return "Dashboard Overview";
    if (p.startsWith("/dashboard/forms")) return "Assessment Forms";
    if (p.startsWith("/dashboard/patient-records"))
      return "Patient Information";
    if (p.startsWith("/dashboard/parental-training"))
      return "Parental Training";
    if (p.startsWith("/dashboard/qr-attendance")) return "QR Attendance";
    if (p.startsWith("/dashboard/therapy-tracking")) return "Therapy Tracking";
    if (p.startsWith("/dashboard/therapy-sessions")) return "Therapy Sessions";
    if (p.startsWith("/dashboard/appointments"))
      return "Appointment Management";
    if (p.startsWith("/dashboard/manage-users")) return "Manage Users";
    if (p.startsWith("/dashboard/rdhs")) return "RDHS";
    if (p.startsWith("/dashboard/reports")) return "Reports";
    if (p.startsWith("/dashboard/documents")) return "Documents";
    if (p.startsWith("/dashboard/adminuploaddocs"))
      return "Upload Resources for Patents";
    if (p.startsWith("/dashboard/viewdocs"))
      return "View Resources for Patents";
    if (p.startsWith("/dashboard/forms/monreturn"))
      return "Upload Monthly Returns ";
    return "Welcome";
  })();

  const breadcrumb = (() => {
    const base = [{ label: "Dashboard", onClick: handleHome }];
    const parts = location.pathname
      .replace("/dashboard", "")
      .split("/")
      .filter(Boolean);
    const crumbs = parts.map((seg, idx) => {
      const href = "/dashboard/" + parts.slice(0, idx + 1).join("/");
      return {
        label: prettify(seg),
        onClick: () => navigate(href),
      };
    });
    return [...base, ...crumbs];
  })();

  function prettify(str) {
    return str.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  }

  // Check user type for permissions
  const canAccessPatientInfo =
    loggedInUser?.userType === "Super Admin" ||
    loggedInUser?.userType === "Admin";
  const canAccessAdminPanel =
    loggedInUser?.userType === "Super Admin" ||
    loggedInUser?.userType === "Admin";

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 antialiased overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white
          transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-80" : "w-20"
          } flex flex-col shadow-2xl relative z-20`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex items-center justify-between h-20 px-4">
          <div className="flex items-center gap-3">
            {!isSidebarOpen ? (
              <button
                onClick={handleHome}
                className="rounded-xl p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                title="Dashboard Home"
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-2xl text-white"
                />
              </button>
            ) : (
              <h1
                onClick={handleHome}
                className="text-2xl font-extrabold tracking-tight text-white cursor-pointer drop-shadow-sm"
                title="Go Home"
              >
                Mathavam
              </h1>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="ml-2 bg-white/15 backdrop-blur text-white p-2 rounded-xl shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar ([)"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem
            icon={faHome}
            label="Dashboard Home"
            isOpen={isSidebarOpen}
            onClick={handleHome}
            isActive={isActive("/dashboard")}
            color="blue"
          />
          <SectionLabel isOpen={isSidebarOpen} text="Core" />
          {canAccessPatientInfo && (
            <NavItem
              icon={faClipboardList}
              label="Patient Information"
              isOpen={isSidebarOpen}
              onClick={handleRecordingSheet}
              isActive={isActive("/dashboard/patient-records")}
              color="sky"
            />
          )}
          <NavItem
            icon={faNotesMedical}
            label="Assessment Forms"
            isOpen={isSidebarOpen}
            onClick={handleSkillAssessmentForms}
            isActive={isActive("/dashboard/forms")}
            color="teal"
          />
          <NavItem
            icon={faHeartbeat}
            label="Therapy Tracking"
            isOpen={isSidebarOpen}
            onClick={handleTherapyTracking}
            isActive={isActive("/dashboard/therapy-tracking")}
            color="indigo"
          />
          <NavItem
            icon={faCalendarCheck}
            label="Appointment Management"
            isOpen={isSidebarOpen}
            onClick={handleAppointmentManagement}
            isActive={isActive("/dashboard/appointments")}
            color="blue"
          />
          <NavItem
            icon={faQrcode}
            label="QR Attendance"
            isOpen={isSidebarOpen}
            onClick={handleQRAttendance}
            isActive={isActive("/dashboard/qr-attendance")}
            color="sky"
          />
          <NavItem
            icon={faHospital}
            label="RDHS"
            isOpen={isSidebarOpen}
            onClick={handleRDHS}
            isActive={isActive("/dashboard/rdhs")}
            color="indigo"
          />
          <NavItem
            icon={faUserGraduate}
            label="Parental Training"
            isOpen={isSidebarOpen}
            onClick={handleParentalTraining}
            isActive={isActive("/dashboard/parental-training")}
            color="teal"
          />
          <NavItem
            icon={faUserGraduate}
            label="Resources for Parents"
            isOpen={isSidebarOpen}
            onClick={handleViewofParentsReadingResources}
            isActive={isActive("/dashboard/viewdocs")}
            color="teal"
          />
          {canAccessAdminPanel && (
            <>
              <SectionLabel isOpen={isSidebarOpen} text="Admin" />
              <NavItem
                icon={faUsers}
                label="Manage Users"
                isOpen={isSidebarOpen}
                onClick={handleManageUsers}
                isActive={isActive("/dashboard/manage-users")}
                color="blue"
              />
              <NavItem
                icon={faNotesMedical}
                label="Upload Reading Resources for Parents "
                isOpen={isSidebarOpen}
                onClick={handleParentsReadingResources}
                isActive={isActive("/dashboard/adminuploaddocs")}
                color="blue"
              />
              <NavItem
                icon={faNotesMedical}
                label="Upload Monthly Returns "
                isOpen={isSidebarOpen}
                onClick={handleMonthlyReturns}
                isActive={isActive("/dashboard/forms/monreturn")}
                color="blue"
              />
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-white rounded-l-3xl shadow-sm overflow-hidden my-4 ml-4 transition-all duration-300 ease-in-out border border-gray-100">
        <header className="flex items-center justify-between gap-4 p-5 bg-white border-b-4 border-blue-600 shadow-md sticky top-0 z-10">
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
              {breadcrumb.map((c, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-gray-300">/</span>}
                  <button
                    onClick={c.onClick}
                    className="hover:text-blue-700 focus:outline-none focus:underline"
                    title={`Go to ${c.label}`}
                  >
                    {c.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-semibold text-gray-800">
                {currentTitle}
              </h2>
              {currentTitle === "Dashboard Overview" && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quick glance of activity, tasks, and patient pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search patients, sessions, docs…"
                className="w-72 rounded-xl border border-gray-200 pl-10 pr-3 py-2 text-sm
                                focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-gray-400"
              />
            </div>

            <IconButton icon={faBell} badge title="Notifications" />
            <IconButton icon={faCog} title="Settings" />

            {loggedInUser ? (
              <div className="relative">
                <button
                  id="account-dropdown-btn"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm shadow-inner cursor-pointer hover:bg-blue-100 transition-colors"
                  title="Account"
                  onClick={() => setShowAccountDropdown((v) => !v)}
                >
                  <div className="h-6 w-6 rounded-full bg-blue-200 grid place-items-center text-xs font-bold">
                    {loggedInUser.firstName?.[0]}
                    {loggedInUser.lastName?.[0]}
                  </div>
                  <span className="hidden sm:block">
                    Hi, {loggedInUser.firstName} {loggedInUser.lastName}
                  </span>
                  <svg
                    className={`ml-1 w-3 h-3 transition-transform ${
                      showAccountDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showAccountDropdown && (
                  <div
                    id="account-dropdown-menu"
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
                Loading User…
              </div>
            )}
          </div>
        </header>

        {location.pathname === "/dashboard" && (
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
        )}

        <div className="flex-1 bg-gray-100 overflow-y-auto rounded-br-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
