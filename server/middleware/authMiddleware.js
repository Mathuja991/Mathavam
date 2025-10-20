// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from header
    let token = req.header('x-auth-token'); 
    
    // Optional: Also check for standard 'Authorization: Bearer <token>'
    if (!token && req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
        token = req.header('Authorization').slice(7);
    }
    
    // 2. Check if no token is found
    if (!token) {
        return res.status(401).json({ 
            message: 'Access Denied. User ID is missing. Please log in again.', 
            errorType: 'NO_TOKEN' 
        });
    }

    // 3. Verify token
    try {
        // JWT_SECRET should be defined in your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- THIS IS THE FIX ---
        //
        // මෙම වෙනස් කිරීම මගින් token payload එක { user: { id: ... } } ලෙස (nested)
        // හෝ { id: ... } ලෙස (flat) තිබුණත්, එය නිවැරදිව req.user වෙත ලබා දේ.
        //
        // We set req.user to decoded.user (if it exists)
        // OR we set it to the entire decoded object (if it's flat)
        req.user = decoded.user || decoded; 
        
        next(); // Move to the next controller function
    } catch (err) {
        // If token is invalid (expired, wrong secret, malformed)
        console.error('Token verification failed:', err.message);
        res.status(401).json({ 
            message: 'Invalid Token. Please log in again.',
            errorType: 'INVALID_TOKEN' 
        });
    }
};