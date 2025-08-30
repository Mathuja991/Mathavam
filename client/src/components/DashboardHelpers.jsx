// Helper function to check if a navigation item is active
export const isActive = (path, location) => {
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

// Helper function to format a string for display in breadcrumbs
export const prettify = (str) => {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};