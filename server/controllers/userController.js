// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure dotenv is configured

// @desc    Add a new user
// @route   POST /api/users/add
// @access  Public
exports.addUser = async (req, res) => {
    // console.log('Received request body in addUser:', req.body); // Uncomment if needed
    const { firstName, lastName, idNumber, userType, username, password, confirmPassword, childRegNo } = req.body;

    // Validation
    if (!firstName || !lastName || !idNumber || !userType || !username || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    // Ensure childRegNo is provided *only* if userType is Parent
    if (userType === 'Parent' && !childRegNo) {
        return res.status(400).json({ message: 'Please enter Child Registration Number for Parent user type.' });
    }
    if (userType !== 'Parent' && childRegNo) {
         // Prevent assigning childRegNo to non-parent users if desired
         // console.warn(`Attempted to assign childRegNo to non-parent user type: ${userType}`);
         // Or return an error: return res.status(400).json({ message: 'Child Registration Number is only applicable for Parent user type.' });
    }


    try {
        // Check if user exists
        let userById = await User.findOne({ idNumber });
        if (userById) {
            return res.status(400).json({ message: 'User with this ID Number already exists' });
        }
        let userByUsername = await User.findOne({ username: username.toLowerCase() });
        if (userByUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            idNumber,
            userType,
            username: username.toLowerCase(),
            password: hashedPassword,
            // Assign childRegNo ONLY if userType is Parent
            childRegNo: userType === 'Parent' ? childRegNo : null,
        });

        // Save user
        const savedUser = await newUser.save();

        const userToReturn = { ...savedUser._doc };
        delete userToReturn.password;

        res.status(201).json({
            message: 'User added successfully',
            user: userToReturn
        });

    } catch (err) {
        console.error('Error in addUser:', err.message);
        // Provide more specific error if validation failed
        if (err.name === 'ValidationError') {
             const messages = Object.values(err.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error adding user. Please try again.' });
    }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private (Requires valid token via authMiddleware)
exports.getAllUsers = async (req, res) => {
    try {
        // req.user should be attached by authMiddleware
        // console.log("getAllUsers requested by user:", req.user.id);
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (err) {
        console.error('Error in getAllUsers:', err.message);
        res.status(500).send('Server Error fetching users.');
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter both username and password' });
    }

    try {
        // 1. Find user (case-insensitive username)
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 3. Create JWT Payload (using userId from DB)
        // Ensure user.id (Mongoose virtual for _id) exists
         if (!user.id) {
            console.error(`CRITICAL ERROR: User found but missing .id! User: ${user.username}`);
            return res.status(500).json({ msg: 'Server error generating token' });
        }
        const payload = {
             // Use 'userId' to match the authMiddleware expectation
            userId: user.id
            // You can add userType here if needed by middleware later
            // userType: user.userType
        };

        // 4. Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // Token expiration (e.g., 7 days)
            (err, token) => {
                if (err) {
                     console.error('JWT Signing Error:', err);
                     return res.status(500).json({ msg: 'Error generating token' });
                }

                // --- 5. THE FIX: Ensure childRegNo is included in the response USER object ---
                // Send back the token AND the user object (including childRegNo) for localStorage
                res.json({
                    token,
                    user: { // This object goes into localStorage on the frontend
                        id: user.id, // Use .id virtual
                        _id: user._id, // Include _id as well if needed elsewhere
                        username: user.username,
                        userType: user.userType,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        childRegNo: user.childRegNo // Include childRegNo here!
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).send('Server error during login.');
    }
};


// @desc    Update user's username
// @route   PUT /api/users/update-username
// @access  Private
exports.updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const userId = req.user.id; // authMiddleware එකෙන් එන user ID එක

    if (!newUsername) {
        return res.status(400).json({ msg: 'New username is required' });
    }

    try {
        // 1. අලුත් username එක දැනටමත් වෙන කෙනෙක් පාවිච්චි කරනවද බලන්න
        const existingUser = await User.findOne({ username: newUsername.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ msg: 'Username is already taken' });
        }

        // 2. User ව හොයාගෙන update කරන්න
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.username = newUsername.toLowerCase();
        await user.save();

        // 3. Frontend එකට update කරපු user ගේ තොරතුරු ටික (localStorage එක update කිරීමට) යවන්න
        res.json({
            msg: 'Username updated successfully',
            user: {
                id: user.id,
                _id: user._id,
                username: user.username,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
                childRegNo: user.childRegNo
            }
        });

    } catch (err) {
        console.error('Update Username Error:', err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Update user's password
// @route   PUT /api/users/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    // 1. Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ msg: 'Please fill all password fields' });
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ msg: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    try {
        // 2. User ව හොයාගන්න (password එකත් එක්කම)
        // .select('+password') යොදන්නේ login වෙද්දී වගේ password එක select කරගන්න
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 3. දැනට තියෙන password එක හරිද බලන්න
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        // 4. අලුත් password එක hash කරලා save කරන්න
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });

    } catch (err) {
        console.error('Update Password Error:', err.message);
        res.status(500).send('Server error');
    }
};
    // @desc    Check if user exists and is a doctor
// @route   GET /api/users/check-doctor/:idNumber
// @access  Private
exports.checkDoctor = async (req, res) => {
  try {
    const { idNumber } = req.params;

    const user = await User.findOne({ idNumber }).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        isDoctor: false, 
        message: 'User not found' 
      });
    }

    if (user.userType !== 'Doctor') {
      return res.json({ 
        isDoctor: false, 
        user: null,
        message: 'User is not a doctor' 
      });
    }

    res.json({ 
      isDoctor: true, 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });

  } catch (err) {
    console.error('Error in checkDoctor:', err.message);
    res.status(500).json({ 
      isDoctor: false, 
      message: 'Server error checking doctor' 
    });
  }
};
