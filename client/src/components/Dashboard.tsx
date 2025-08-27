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
  faHospital, // ✅ Suitable for RDHS
} from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
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

  // Keyboard shortcuts: [ toggles sidebar, / focuses search
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
  const handleRDHS = () => navigate("/dashboard/rdhs"); // ✅ dedicated route

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
    if (p.startsWith("/dashboard/patient-records")) return "Patient Information";
    if (p.startsWith("/dashboard/parental-training")) return "Parental Training";
    if (p.startsWith("/dashboard/qr-attendance")) return "QR Attendance";
    if (p.startsWith("/dashboard/therapy-tracking")) return "Therapy Tracking";
    if (p.startsWith("/dashboard/therapy-sessions")) return "Therapy Sessions";
    if (p.startsWith("/dashboard/appointments")) return "Appointment Management";
    if (p.startsWith("/dashboard/manage-users")) return "Manage Users";
    if (p.startsWith("/dashboard/rdhs")) return "RDHS";
    if (p.startsWith("/dashboard/reports")) return "Reports";
    if (p.startsWith("/dashboard/documents")) return "Documents";
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
    return str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

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
                <FontAwesomeIcon icon={faHome} className="text-2xl text-white" />
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

        {/* Sidebar search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search… (/)"
              className="w-full rounded-xl border border-white/20 bg-white/10 text-white
                         pl-10 pr-3 py-2 text-sm placeholder:text-white/70
                         focus:ring-2 focus:ring-white/60 focus:border-white/60"
            />
          </div>
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
          <NavItem
            icon={faClipboardList}
            label="Patient Information"
            isOpen={isSidebarOpen}
            onClick={handleRecordingSheet}
            isActive={isActive("/dashboard/patient-records")}
            color="sky"
          />
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

          {/* ✅ RDHS with a suitable icon */}
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

          <SectionLabel isOpen={isSidebarOpen} text="Admin" />
          <NavItem
            icon={faUsers}
            label="Manage Users"
            isOpen={isSidebarOpen}
            onClick={handleManageUsers}
            isActive={isActive("/dashboard/manage-users")}
            color="blue"
          />
        </nav>

        <div className="p-3 border-t border-white/15">
          <NavItem
            icon={faSignOutAlt}
            label="Logout"
            isOpen={isSidebarOpen}
            onClick={handleLogout}
            isActive={false}
            isLogout={true}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white rounded-l-3xl shadow-sm overflow-hidden my-4 ml-4 transition-all duration-300 ease-in-out border border-gray-100">
        {/* Top Bar */}
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
              <h2 className="text-2xl font-semibold text-gray-800">{currentTitle}</h2>
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

          {/* Right-side controls */}
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
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm shadow-inner cursor-pointer hover:bg-blue-100 transition-colors"
                title="Account"
              >
                <div className="h-6 w-6 rounded-full bg-blue-200 grid place-items-center text-xs font-bold">
                  {loggedInUser.firstName?.[0]}
                  {loggedInUser.lastName?.[0]}
                </div>
                <span className="hidden sm:block">
                  Hi, {loggedInUser.firstName} {loggedInUser.lastName}
                </span>
              </div>
            ) : (
              <div className="flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
                Loading User…
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Overview Enhancements */}
        {location.pathname === "/dashboard" && (
          <section className="p-5 space-y-6">
            {/* Quick stats */}
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

            {/* Quick actions */}
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

        {/* Dynamic Content */}
        <div className="flex-1 bg-gray-100 overflow-y-auto rounded-br-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

const SectionLabel = ({ isOpen, text }) => (
  <div
    className={`${
      isOpen ? "px-3" : "px-0"
    } text-[11px] uppercase tracking-wider text-white/70 mt-3 mb-1`}
  >
    {isOpen ? text : <span className="sr-only">{text}</span>}
  </div>
);

const NavItem = ({
  icon,
  label,
  isOpen,
  onClick,
  isActive,
  isLogout = false,
  color = "indigo",
}) => {
  const activeBg =
    {
      indigo: "bg-indigo-500",
      sky: "bg-sky-500",
      teal: "bg-teal-500",
      blue: "bg-blue-600",
    }[color] || "bg-indigo-500";

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full py-2.5 px-3 rounded-lg text-left text-sm font-medium 
        transition-all duration-200 ease-in-out group
        ${
          isActive
            ? `${activeBg} text-white shadow-[0_6px_20px_-8px_rgba(255,255,255,0.6)]`
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }
        ${isLogout ? "text-red-200 hover:bg-red-600/60 hover:text-white" : ""}
        focus:outline-none focus:ring-2 focus:ring-white/50`}
      title={label}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`${isOpen ? "mr-3" : "mr-0"} text-[17px]`}
      />
      <span
        className={`${
          isOpen ? "opacity-100" : "opacity-0 absolute -left-96"
        } transition-opacity`}
      >
        {label}
      </span>
    </button>
  );
};

const IconButton = ({ icon, badge = false, title }) => (
  <button
    className="relative text-gray-500 hover:text-blue-700 focus:outline-none transition-colors text-xl p-2.5 rounded-full hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 active:scale-95"
    title={title}
  >
    {badge && (
      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
    )}
    <FontAwesomeIcon icon={icon} />
  </button>
);

const StatCard = ({ icon, title, value, sub }) => (
  <div className="group rounded-2xl border border-blue-100 bg-white p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="rounded-xl bg-blue-50 p-3">
        <FontAwesomeIcon icon={icon} className="text-blue-700 text-lg" />
      </div>
      <FontAwesomeIcon icon={faChartBar} className="text-blue-100" />
    </div>
    <div className="mt-3">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
    <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 group-hover:from-blue-300 group-hover:to-blue-200"></div>
  </div>
);

const QuickAction = ({ title, desc, onClick, icon }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-blue-100 bg-white p-4 hover:shadow-md active:scale-[0.99] transition-all"
  >
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3">
        <FontAwesomeIcon icon={icon} className="text-blue-700" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  </button>
);

export default Dashboard;
