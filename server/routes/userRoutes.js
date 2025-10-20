// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// --- THIS IS THE FIX ---
// Add the route for logging in
router.post('/login', userController.loginUser);

// Route to add a new user
router.post('/add', userController.addUser);

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get a single user by ID (optional, but good for editing)
router.get('/:id', userController.getUserById);

// Route to update a user by ID
router.put('/:id', userController.updateUser);

// Route to delete a user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;