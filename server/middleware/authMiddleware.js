// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Get token from header
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    console.error(`[${new Date().toISOString()}] Auth Middleware: No 'x-auth-token' header found for request to ${req.originalUrl}. Access denied.`);
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Attempt to verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // --- Log the decoded payload ---
    console.log(`[${new Date().toISOString()}] Auth Middleware: Token decoded successfully for ${req.originalUrl}. Payload:`, decoded);

    // 4. --- CHECK PAYLOAD FOR 'userId' ---
    if (decoded.userId) {

      // Attach user object { id: '...' }
      req.user = {
          id: decoded.userId
      };

      console.log(`[${new Date().toISOString()}] Auth Middleware: Success! User ID ${req.user.id} attached. Proceeding to next handler for ${req.originalUrl}.`);
      next(); // Proceed to the controller

    } else {
      // If the decoded token doesn't have 'userId'
      console.error(`[${new Date().toISOString()}] Auth Middleware: Token payload is invalid (missing 'userId'). Request to ${req.originalUrl} denied. Decoded Payload:`, decoded);
      return res.status(401).json({ msg: 'Token payload is invalid (missing userId)' });
    }

  } catch (err) {
    // --- IMPROVED ERROR HANDLING ---
    console.error(`[${new Date().toISOString()}] Auth Middleware: Token verification FAILED for ${req.originalUrl}. Error: ${err.name} - ${err.message}. Token provided (first 10 chars): ${token.substring(0, 10)}...`);

    if (err.name === 'TokenExpiredError') {
        // Token එක expire වෙලා නම්
        return res.status(401).json({ msg: 'Token has expired, please log in again' });
    } else if (err.name === 'JsonWebTokenError') {
        // Token එක වැරදි නම් (e.g., JWT_SECRET එක වැරදි නම්)
        return res.status(401).json({ msg: 'Token is invalid (JsonWebTokenError)' });
    } else {
        // වෙනත් error එකක් නම්
        return res.status(401).json({ msg: 'Token is not valid (General Error)' });
    }
  }
};