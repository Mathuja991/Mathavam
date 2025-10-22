// controllers/notificationController.js

const Notification = require('../models/Notification');

// @route   POST /api/notifications
// @desc    Get notifications by childRegNo provided in the body (Case-Insensitive & Trimmed)
exports.getNotifications = async (req, res) => {
  // --- DEBUG 1 ---
  console.log('--- DEBUG: getNotifications (POST) called ---'); 
  try {
    const { childRegNo } = req.body;
    
    // --- DEBUG 2 ---
    console.log('DEBUG: Received childRegNo in request body:', childRegNo);

    if (!childRegNo) {
      console.warn('getNotifications: No childRegNo provided in request body. Returning empty array.');
      return res.json([]); 
    }

    // --- 1. TRIM and CREATE REGEX for Case-Insensitive Search ---
    // Frontend එකෙන් එන RegNo එකේ ඉස්සරහින්/පිටිපස්සෙන් ඇති spaces අයින් කිරීම (trim)
    const trimmedRegNo = childRegNo.trim(); 
    
    // Case-insensitive search එකක් සඳහා Regular Expression එකක් සෑදීම
    // ('i' flag එකෙන් case-insensitive බව කියවේ)
    const searchRegex = new RegExp(`^${trimmedRegNo}$`, 'i'); 
    
    // --- DEBUG 3 ---
    console.log(`DEBUG: Finding notifications using trimmed RegNo: "${trimmedRegNo}" with case-insensitive regex.`);

    // --- 2. Regex එක භාවිතා කර Search කිරීම ---
    // patientRegNo field එක, අප සෑදූ regex එකට ගැලපේදැයි බැලීම
    const notifications = await Notification.find({ 
        patientRegNo: searchRegex 
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // --- DEBUG 4 ---
    console.log(`DEBUG: Found ${notifications.length} notifications matching regex for "${trimmedRegNo}".`);
    
    res.json(notifications); // Frontend එකට data යැවීම

  } catch (err) {
    // --- DEBUG 5 ---
    console.error('Error in getNotifications:', err.message);
    res.status(500).send('Server Error: Could not fetch notifications.');
  }
};

// @route   PUT /api/notifications/mark-read
// @desc    Mark all unread notifications as read by childRegNo provided in the body
exports.markAllAsRead = async (req, res) => {
  // --- DEBUG 6 ---
  console.log('--- DEBUG: markAllAsRead (PUT) called ---');
  try {
    const { childRegNo } = req.body;
    
    // --- DEBUG 7 ---
    console.log('DEBUG: Received childRegNo for mark-read:', childRegNo);

    if (!childRegNo) {
      console.warn('markAllAsRead: No childRegNo provided.');
      return res.status(400).json({ msg: 'Child Registration Number is required.' });
    }

    // --- 3. TRIM and REGEX for Update Query ---
    const trimmedRegNo = childRegNo.trim();
    const updateRegex = new RegExp(`^${trimmedRegNo}$`, 'i');

    // --- DEBUG 8 ---
    console.log(`DEBUG: Updating notifications matching regex for "${trimmedRegNo}" to isRead: true`);

    const result = await Notification.updateMany(
      { patientRegNo: updateRegex, isRead: false }, // Regex එක මෙතනත් භාවිතා කිරීම
      { $set: { isRead: true } }
    );
    
    // --- DEBUG 9 ---
    console.log(`DEBUG: Matched ${result.matchedCount}, Modified ${result.modifiedCount} notifications.`);

    res.json({ msg: 'Notifications marked as read' });

  } catch (err) {
    // --- DEBUG 10 ---
    console.error('Error in markAllAsRead:', err.message);
    res.status(500).send('Server Error: Could not mark notifications as read.');
  }
};