const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Flight search endpoint
router.get('/search', async (req, res) => {
    try {
        const { departure, arrival, date } = req.query;
        
        const flights = await Flight.find({
            'departure.city': { $regex: departure, $options: 'i' },
            'arrival.city': { $regex: arrival, $options: 'i' },
            'departure.time': {
                $gte: new Date(date),
                $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            },
            status: 'scheduled'
        });

        res.json(flights);
    } catch (error) {
        console.error('Flight search error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm chuyến bay. Vui lòng thử lại sau.' });
    }
});

// Flight booking endpoint
router.post('/book', async (req, res) => {
    try {
        const { flightId, passengers, class: flightClass, seats } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt vé' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // Get flight details
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Chuyến bay không tồn tại' });
        }

        // Calculate total amount based on class
        const priceMultiplier = {
            'economy': 1,
            'business': 2,
            'first': 3
        };
        const totalAmount = flight.price * priceMultiplier[flightClass] * passengers.length;

        // Create booking
        const booking = new Booking({
            user: user._id,
            type: 'flight',
            status: 'pending',
            totalAmount,
            paymentStatus: 'pending',
            paymentMethod: 'credit_card', // Default payment method
            flight: {
                flight: flightId,
                passengers,
                class: flightClass,
                seats
            }
        });

        await booking.save();

        res.status(201).json({
            message: 'Đặt vé thành công',
            booking
        });
    } catch (error) {
        console.error('Flight booking error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại sau.' });
    }
});

module.exports = router; 