const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Map địa danh chuẩn hóa
const locationMap = {
    'hanoi': 'Hà Nội',
    'ha noi': 'Hà Nội',
    'hn': 'Hà Nội',
    'hochiminh': 'Hồ Chí Minh',
    'ho chi minh': 'Hồ Chí Minh',
    'hcm': 'Hồ Chí Minh',
    'saigon': 'Hồ Chí Minh',
    'danang': 'Đà Nẵng',
    'da nang': 'Đà Nẵng',
    'dalat': 'Đà Lạt',
    'da lat': 'Đà Lạt',
    'hue': 'Huế',
    'nhatrang': 'Nha Trang',
    'nha trang': 'Nha Trang',
    'phuquoc': 'Phú Quốc',
    'phu quoc': 'Phú Quốc',
    'sapa': 'Sapa'
};

// Hàm chuẩn hóa tiếng Việt
const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '');
};

// Tìm kiếm chuyến bay
router.get('/search', async (req, res) => {
    try {
        const { departure, arrival, date, passengers = 1, class: flightClass = 'economy' } = req.query;

        if (!departure || !arrival || !date) {
            return res.status(400).json({ message: 'Thiếu thông tin điểm đi, điểm đến hoặc ngày khởi hành.' });
        }

        const normalizedDeparture = normalizeText(departure);
        const normalizedArrival = normalizeText(arrival);

        const vietnameseDeparture = locationMap[normalizedDeparture] || departure;
        const vietnameseArrival = locationMap[normalizedArrival] || arrival;

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(startDate.getDate() + 1);

        const flights = await Flight.find({
            'departure.city': { $regex: vietnameseDeparture, $options: 'i' },
            'arrival.city': { $regex: vietnameseArrival, $options: 'i' },
            'departure.time': {
                $gte: startDate,
                $lt: endDate
            },
            availableSeats: { $gte: parseInt(passengers) },
            status: 'scheduled'
        });

        res.json(flights);
    } catch (error) {
        console.error('Flight search error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm chuyến bay. Vui lòng thử lại sau.' });
    }
});

// Đặt vé máy bay
router.post('/book', async (req, res) => {
    try {
        const { flightId, passengers, class: flightClass } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt vé' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Chuyến bay không tồn tại' });
        }

        const seatCount = passengers.length;
        if (flight.availableSeats < seatCount) {
            return res.status(400).json({ message: 'Không đủ chỗ ngồi trên chuyến bay' });
        }

        const priceMultiplier = {
            'economy': 1,
            'business': 2,
            'first': 3
        };

        const multiplier = priceMultiplier[flightClass] || 1;
        const totalAmount = flight.price * multiplier * seatCount;

        const booking = new Booking({
            user: user._id,
            type: 'flight',
            totalAmount,
            paymentMethod: 'credit_card', // Or make this dynamic
            flight: {
                flight: flight._id,
                passengers,
                class: flightClass
            }
        });

        if (user.balance >= totalAmount) {
            user.balance -= totalAmount;
            flight.availableSeats -= seatCount; // Deduct seats only if payment is successful
            await user.save();
            await flight.save();
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
            res.status(201).json({
                booking,
                message: 'Đặt vé máy bay thành công và đã thanh toán.',
                redirectToPayment: false
            });
        } else {
            booking.paymentStatus = 'pending';
            booking.status = 'pending';
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24);
            booking.paymentDeadline = deadline;
            await booking.save();
            // Do not deduct seats here, as payment is not yet made.
            // Seats could be reserved temporarily or handled by a separate mechanism.
            res.status(201).json({
                booking,
                message: 'Đặt vé máy bay thành công. Vui lòng thanh toán trong vòng 24 giờ.',
                redirectToPayment: true
            });
        }
    } catch (error) {
        console.error('Flight booking error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại sau.' });
    }
});

module.exports = router;
