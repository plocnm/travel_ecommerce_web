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
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Recalculate tier to ensure it's up-to-date
        let currentExpectedTier;
        if (user.balance > 100000000) {
            currentExpectedTier = 'Diamond';
        } else if (user.balance > 50000000) {
            currentExpectedTier = 'Gold';
        } else if (user.balance > 10000000) {
            currentExpectedTier = 'Silver';
        } else {
            currentExpectedTier = 'Bronze';
        }

        // If the stored tier is different from the expected tier, update and save
        if (user.tier !== currentExpectedTier) {
            user.tier = currentExpectedTier;
            await user.save(); // This ensures the DB is updated and pre-save hook logic is consistent
        }

        // Ensure you return the fields the frontend expects, excluding sensitive ones
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone, 
            balance: user.balance,
            tier: user.tier // Return the (potentially updated) tier
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
        
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role !== undefined) user.role = role;
        if (status !== undefined) user.status = status; // Assuming you have a status field
        if (balance !== undefined) user.balance = balance;

        const updatedUser = await user.save(); // This will trigger the pre-save hook for tier update
        
        // Exclude sensitive fields for the response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationCode; 
        delete userResponse.resetPasswordCode;
        // delete userResponse.resetCodeExpiry; // If you still have this
        delete userResponse.__v;

        console.log('User updated in DB:', userResponse); 
        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

module.exports = router;