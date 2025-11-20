import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faSignOutAlt, faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import IconButton from "../IconButton";
import NotificationBell from "../NotificationBell";
import AccountSettingsModal from "./AccountSettingsModal";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Title mapping for cleaner code and reduced lines
const TITLE_MAP = [
    { path: "/dashboard/forms/monreturn", title: "Upload Monthly Returns" },
    { path: "/dashboard/adminuploaddocs", title: "Upload Reading Resources for Parents" },
    { path: "/dashboard/manage-users", title: "Manage Users" },
    { path: "/dashboard/viewdocs", title: "Resources for Parents" },
    { path: "/dashboard/parental-training", title: "Parental Training" },
    { path: "/dashboard/rdhs", title: "RDHS" },
    { path: "/dashboard/qr-attendance", title: "QR Attendance" },
    { path: "/dashboard/appointments", title: "Appointment Management" },
    { path: "/dashboard/therapy-tracking", title: "Therapy Tracking" },
    { path: "/dashboard/patient-records", title: "Patient Information" },
    { path: "/dashboard/forms", title: "Assessment Forms" },
    { path: "/dashboard", title: "Dashboard Overview" },
];

const DashboardHeader = ({
    loggedInUser,
    handleLogout,
    onUserUpdate,
    toggleSidebar,
}) => {
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const passwordPolicy = {
        minLength: 6,
        maxLength: 12,
        requireCapital: true,
        requireLowercase: true,
        requireNumber: true,
        requireSymbol: true,
    };

    useEffect(() => {
        if (!showAccountDropdown) return;
        const handler = (e) => {
            const target = e.target;
            if (
                !target?.closest("#account-dropdown-btn") &&
                !target?.closest("#account-dropdown-menu")
            ) {
                setShowAccountDropdown(false);
            }
        };
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, [showAccountDropdown]);

    const confirmLogout = () => {
        Swal.fire({
            title: "Confirm Logout", 
            text: "You will be redirected to the login page.", 
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3B82F6",
            cancelButtonColor: "#EF4444",
            confirmButtonText: "Yes, Log Out", 
            cancelButtonText: "Cancel", 
            customClass: {
                popup: "font-sans rounded-lg",
                title: "text-slate-900",
                htmlContainer: "text-slate-600",
                confirmButton: "text-white bg-blue-600 hover:bg-blue-700",
                cancelButton: "text-white bg-red-600 hover:bg-red-700",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                handleLogout();
            }
        });
    };

    const prettify = (str) => str.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    
    // Refactored title logic using the TITLE_MAP for reduced lines
    const currentTitle = useMemo(() => {
        const path = location.pathname;
        const match = TITLE_MAP
            .sort((a, b) => b.path.length - a.path.length) 
            .find(item => path.startsWith(item.path));
        return match ? match.title : "Welcome";
    }, [location.pathname]);

    // Refactored breadcrumb logic
    const breadcrumb = useMemo(() => {
        const base = [{ label: "Dashboard", onClick: () => navigate("/dashboard") }];
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
    }, [location.pathname, navigate]);

    return (
        <>
            <header
                className="flex items-center justify-between gap-4 p-4 md:p-5 bg-white 
                                 border-b border-slate-200/80 shadow-sm sticky top-0 z-10"
            >
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Open Menu"
                >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="hidden md:flex items-center flex-wrap gap-2 text-sm text-slate-500 font-medium">
                        {breadcrumb.map((c, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-slate-300">/</span>}
                                <button
                                    onClick={c.onClick}
                                    className="hover:text-blue-600 focus:outline-none focus:underline transition-colors"
                                    title={`Go to ${c.label}`}
                                >
                                    {c.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                            {currentTitle}
                        </h2>
                        {currentTitle === "Dashboard Overview" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium hidden sm:inline-block">
                                Live
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 mt-1 hidden md:block">
                        Quick glance of activity, tasks, and patient pipeline.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {loggedInUser && <NotificationBell user={loggedInUser} />}
                    <IconButton
                        icon={faCog}
                        title="Settings"
                        onClick={() => setIsSettingsModalOpen(true)}
                    />

                    {loggedInUser ? (
                        <div className="relative">
                            <button
                                id="account-dropdown-btn"
                                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-slate-100 text-slate-700 
                                                font-medium text-sm cursor-pointer hover:bg-slate-200/70 transition-colors"
                                title="Account"
                                onClick={() => setShowAccountDropdown((v) => !v)}
                            >
                                <div className="h-7 w-7 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
                                    {loggedInUser.firstName?.[0]}
                                    {loggedInUser.lastName?.[0]}
                                </div>
                                <span className="hidden sm:block">
                                    Hi, {loggedInUser.firstName}
                                </span>
                                <svg
                                    className={`ml-1 w-4 h-4 text-slate-500 transition-transform hidden sm:block ${
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
                                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-1.5"
                                >
                                    <button
                                        onClick={confirmLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 
                                            rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm animate-pulse">
                            Loading User…
                        </div>
                    )}
                </div>
            </header>

            {isSettingsModalOpen && (
                <AccountSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    loggedInUser={loggedInUser}
                    onUserUpdate={onUserUpdate}
                    passwordPolicy={passwordPolicy}
                />
            )}
        </>
    );
};

export default DashboardHeader;