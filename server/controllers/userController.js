const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Child = require('../models/Child');
const Appointment = require('../models/Appointment');

const addUser = async (req, res) => {
    const { firstName, lastName, idNumber, userType, username, password, confirmPassword, childRegNo } = req.body;

    if (!firstName || !lastName || !idNumber || !userType || !username || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (userType === 'Parent' && !childRegNo) {
        return res.status(400).json({ message: 'Please enter Child Registration Number for Parent user type.' });
    }

    try {
        let userById = await User.findOne({ idNumber });
        if (userById) {
            return res.status(400).json({ message: 'User with this ID Number already exists' });
        }
        let userByUsername = await User.findOne({ username: username.toLowerCase() });
        if (userByUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            idNumber,
            userType,
            username: username.toLowerCase(),
            password: hashedPassword,
            childRegNo: userType === 'Parent' ? childRegNo : null,
        });

        const savedUser = await newUser.save();

        const userToReturn = { ...savedUser._doc };
        delete userToReturn.password;

        res.status(201).json({
            message: 'User added successfully',
            user: userToReturn
        });

    } catch (err) {
        console.error('Error in addUser:', err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error adding user. Please try again.' });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error in getAllUsers:', err.message);
        res.status(500).send('Server Error fetching users.');
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter both username and password' });
    }

    try {
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            userId: user.id
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Signing Error:', err);
                    return res.status(500).json({ msg: 'Error generating token' });
                }

                res.json({
                    token,
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
            }
        );
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).send('Server error during login.');
    }
};


const updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const userId = req.user.id;

    if (!newUsername) {
        return res.status(400).json({ msg: 'New username is required' });
    }

    try {
        const existingUser = await User.findOne({ username: newUsername.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ msg: 'Username is already taken' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.username = newUsername.toLowerCase();
        await user.save();

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

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

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
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });

    } catch (err) {
        console.error('Update Password Error:', err.message);
        res.status(500).send('Server error');
    }
};

const resetPasswordIfValid = async (req, res) => {
    const { username, firstName, lastName, idNumber, newPassword, confirmNewPassword } = req.body;

    if (!username || !firstName || !lastName || !idNumber || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: 'All fields are required for verification.' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New passwords do not match.' });
    }
    
    if (newPassword.length < 6) { 
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const user = await User.findOne({ 
            username: username.toLowerCase(), 
            firstName, 
            lastName, 
            idNumber 
        });

        if (!user) {
            return res.status(404).json({ message: 'User verification failed. Please check your details.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in with your new password.' });

    } catch (err) {
        console.error('Password Reset Error:', err.message);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};


const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await Child.countDocuments();

        const staffRoles = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];
        const activeStaff = await User.countDocuments({ userType: { $in: staffRoles } });

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const appointmentsToday = await Appointment.countDocuments({
            appointmentDate: {
                $gte: startOfToday,
                $lte: endOfToday,
            },
            status: { $ne: 'Cancelled' }
        });

        const pendingTasks = await Appointment.countDocuments({
            status: 'Pending'
        });


        res.status(200).json({
            success: true,
            totalPatients,
            appointmentsToday,
            pendingTasks,
            activeStaff,
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard statistics.' });
    }
};

const checkDoctor = async (req, res) => {
    const { idNumber } = req.params;

    if (!idNumber) {
        return res.status(400).json({ message: 'ID Number is required' });
    }

    try {
        const doctor = await User.findOne({
            idNumber,
            userType: 'Doctor'
        });

        if (doctor) {
            res.status(200).json({ isDoctor: true, message: 'Doctor found.', doctor: doctor.firstName + ' ' + doctor.lastName });
        } else {
            res.status(200).json({ isDoctor: false, message: 'Doctor not found with this ID.' });
        }

    } catch (error) {
        console.error('Error in checkDoctor:', error.message);
        res.status(500).json({ message: 'Server error checking doctor status.' });
    }
};


module.exports = {
    addUser,
    getAllUsers,
    loginUser,
    updateUsername,
    updatePassword,
    getDashboardStats,
    checkDoctor,
    resetPasswordIfValid,
};