const normalizeRole = (role) => (role || '').trim().toLowerCase();

const checkRole = (allowedRoles) => {
  const normalizedAllowed = (allowedRoles || []).map(normalizeRole);

  return (req, res, next) => {
    if (!req.user || !req.user.userType) {
      console.error(`[${new Date().toISOString()}] CheckRole Middleware: 'req.user' object not found or 'userType' is missing. authMiddleware eka issella run wenna one.`);
      return res.status(403).json({ msg: 'Authorization failed: User data not available' });
    }

    const userRole = req.user.userType;
    const normalizedUserRole = normalizeRole(userRole);

    if (normalizedAllowed.includes(normalizedUserRole)) {
      next();
    } else {
      console.warn(
        `[${new Date().toISOString()}] CheckRole Middleware: Access DENIED for User ID ${req.user.id} (Role: ${userRole}). Required roles: [${allowedRoles.join(', ')}] for path ${req.originalUrl}.`
      );
      return res.status(403).json({ msg: 'Access Denied: You do not have permission to perform this action' });
    }
  };
};

module.exports = checkRole;
