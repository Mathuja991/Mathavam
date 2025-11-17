const express = require('express');
const router = express.Router();

// --- 1. Controller Functions Import කිරීම (Destructuring) ---
// getAllUsers ලෙස 's' අකුර ඇති බවට වග බලා ගන්න
const {
  addUser,
  getAllUsers,
  loginUser,
  updateUsername,
  updatePassword,
  checkDoctor
} = require('../controllers/userController');

// --- 2. Auth Middleware Import කිරීම ---
// මෙතනදී { } වරහන් නොමැතිව import කිරීම අත්‍යවශ්‍යයි
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/users/add
// @desc    Add a new user
// @access  Public
router.post('/add', addUser);

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// --- 3. 17 වන පේළිය (ගැටළුව තිබූ තැන) ---
// @route   GET /api/users
// @desc    Get all users
// @access  Private (authMiddleware යොදා ආරක්ෂිත කර ඇත)
router.get('/', authMiddleware, getAllUsers); // <-- ගැටළුව තිබූ පේළිය මෙය විය හැක

// (ඔබට user ID එකෙන් user ව ලබාගන්නා route එකක් ඇත්නම් එය මෙතනට දාන්න,
// උදා: router.get('/:id', authMiddleware, getUserById); )

// --- 4. අලුත් Routes දෙක එකතු කිරීම ---

// @route   PUT /api/users/update-username
// @desc    Update logged-in user's username
// @access  Private
router.put('/update-username', authMiddleware, updateUsername);

// @route   PUT /api/users/update-password
// @desc    Update logged-in user's password
// @access  Private
router.put('/update-password', authMiddleware, updatePassword,);

router.get('/check-doctor/:idNumber', checkDoctor);
module.exports = router;