// server/middleware/checkRoleMiddleware.js

/**
 * Meka Role-Based Access Control (RBAC) middleware ekak.
 * Me function eka 'allowedRoles' kiyana array ekak gannawa.
 * E array eke thiyena role ekak user ta nathnam, 403 Forbidden error ekak return karanawa.
 * * Use karana widiha:
 * router.get(
 * '/admin-stuff', 
 * authMiddleware, 
 * checkRole(['Super Admin', 'Admin']), // Meka use karana hati
 * adminController.getStuff
 * );
 */
const normalizeRole = (role) => (role || '').trim().toLowerCase();

const checkRole = (allowedRoles) => {
  // Normalize all allowed roles once for a case/spacing-insensitive comparison
  const normalizedAllowed = (allowedRoles || []).map(normalizeRole);

  return (req, res, next) => {
    // authMiddleware eken 'req.user' object eka set karala thiyenna one
    if (!req.user || !req.user.userType) {
      console.error(`[${new Date().toISOString()}] CheckRole Middleware: 'req.user' object not found or 'userType' is missing. authMiddleware eka issella run wenna one.`);
      return res.status(403).json({ msg: 'Authorization failed: User data not available' });
    }

    const userRole = req.user.userType;
    const normalizedUserRole = normalizeRole(userRole);

    // 'allowedRoles' array eke userge role eka thiyenawada balanawa (case-insensitive)
    if (normalizedAllowed.includes(normalizedUserRole)) {
      // Role eka hari. Controller ekata yanna denawa.
      next();
    } else {
      // Role eka naha. Access deny karanawa.
      console.warn(
        `[${new Date().toISOString()}] CheckRole Middleware: Access DENIED for User ID ${req.user.id} (Role: ${userRole}). Required roles: [${allowedRoles.join(', ')}] for path ${req.originalUrl}.`
      );
      return res.status(403).json({ msg: 'Access Denied: You do not have permission to perform this action' });
    }
  };
};

module.exports = checkRole;
