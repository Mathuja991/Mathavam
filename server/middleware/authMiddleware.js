// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Get token from header (support both legacy x-auth-token and standard Authorization: Bearer)
  const bearerHeader = req.header('authorization') || req.header('Authorization');
  const bearerToken = bearerHeader && bearerHeader.startsWith('Bearer ')
    ? bearerHeader.replace(/Bearer\s+/i, '')
    : null;
  const token = req.header('x-auth-token') || bearerToken;

  // 2. Check if no token
  if (!token) {
    console.error(`[${new Date().toISOString()}] Auth Middleware: No 'x-auth-token' header found for request to ${req.originalUrl}. Access denied.`);
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[${new Date().toISOString()}] Auth Middleware: Token decoded successfully for ${req.originalUrl}. Payload:`, decoded);

    // 4. --- PAYLOAD EKA CHECK KIRIMA (MEKA THAMAI WENASA) ---
    // decoded payload eke 'userId' HA 'userType' thiyenna one
    // Obage authRoutes.js eken me deka enawa.
    if (decoded.userId && decoded.userType) {

      // req.user object ekata data dekama attach karanna
      req.user = {
          id: decoded.userId,
          userType: decoded.userType // <-- MEKA THAMAI ALUTH WENASA
      };

      console.log(`[${new Date().toISOString()}] Auth Middleware: Success! User ID ${req.user.id} (Role: ${req.user.userType}) attached. Proceeding...`);
      next(); // Controller ekata yanna

    } else {
      // Token eke payload eka waradi nam
      console.error(`[${new Date().toISOString()}] Auth Middleware: Token payload is invalid (missing 'userId' or 'userType'). Request to ${req.originalUrl} denied.`);
      return res.status(401).json({ msg: 'Token payload is invalid' });
    }

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Auth Middleware: Token verification FAILED for ${req.originalUrl}. Error: ${err.name} - ${err.message}.`);
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token has expired, please log in again' });
    } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'Token is invalid' });
    }
    return res.status(500).json({ msg: 'Server error during token verification' });
  }
};
