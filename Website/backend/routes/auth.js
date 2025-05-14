const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        console.log(`User found: ${user.email}, Stored Hashed Password: ${user.password}`);

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log(`Password comparison result (isMatch): ${isMatch}`);

        if (!isMatch) {
            console.log(`Password mismatch for user: ${email}`);
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password
        });

        await user.save();
        console.log('User created successfully:', email);

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.' });
    }
});

module.exports = router; 