const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware'); // Import middlewares
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get all users (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').lean();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get current logged-in user's details
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user is populated by authMiddleware and contains the decoded token (e.g., userId)
        const user = await User.findById(req.user.userId).select('-password -verificationCode -resetPasswordCode -resetCodeExpiry -__v'); // Exclude sensitive fields

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Ensure you return the fields the frontend expects: name, email, phone
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone, // Assuming 'phone' exists on your User model
            balance: user.balance // Add balance to the response
        });
    } catch (error) {
        console.error('Error fetching current user details:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// Update current logged-in user's profile
router.put('/update-profile', authMiddleware, async (req, res) => {
    const userId = req.user.userId; // lấy từ middleware đã decode JWT
    const { name, phone, password } = req.body;

    try {
        const updateData = {
            name,
            phone,
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        res.json({ message: 'Thông tin đã được cập nhật' });
    } catch (err) {
        console.error('Error updating profile for user:', userId, err); // Log more details
        res.status(500).json({ message: `Lỗi server khi cập nhật: ${err.message}` }); // Send back more specific error
    }
});

// Update user role/status (admin only)
router.put('/:userId', verifyAdmin, async (req, res) => {
    try {
        console.log('Update request for userId:', req.params.userId, 'Body:', req.body); // Added console.log
        const { role, status, balance } = req.body;
        const updateFields = {};
        if (role !== undefined) updateFields.role = role;
        if (status !== undefined) updateFields.status = status;
        if (balance !== undefined) updateFields.balance = balance;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updateFields,
            { new: true, select: '-password' }
        );
        
        console.log('User updated in DB:', user); // Added console.log
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

module.exports = router;