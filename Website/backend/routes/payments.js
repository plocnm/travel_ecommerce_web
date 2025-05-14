const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Process payment endpoint
router.post('/process', async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để thanh toán' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // Get booking details
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Đơn đặt không tồn tại' });
        }

        // Check if booking belongs to user
        if (booking.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền thanh toán đơn đặt này' });
        }

        // Check if booking is already paid
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Đơn đặt đã được thanh toán' });
        }

        // Check if user has enough balance
        if (user.balance < booking.totalAmount) {
            return res.status(400).json({ message: 'Số dư không đủ để thanh toán' });
        }

        // Process payment
        user.balance -= booking.totalAmount;
        await user.save();

        booking.paymentStatus = 'paid';
        booking.paymentMethod = paymentMethod;
        booking.status = 'confirmed';
        await booking.save();

        res.json({
            message: 'Thanh toán thành công',
            booking
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại sau.' });
    }
});

// Get payment history endpoint
router.get('/history', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để xem lịch sử thanh toán' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // Get user's paid bookings
        const bookings = await Booking.find({
            user: user._id,
            paymentStatus: 'paid'
        }).sort({ bookingDate: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy lịch sử thanh toán. Vui lòng thử lại sau.' });
    }
});

module.exports = router; 