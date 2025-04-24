const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Hotel search endpoint
router.get('/search', async (req, res) => {
    try {
        const { location, checkinDate, checkoutDate, rooms } = req.query;

        // Parse checkinDate and checkoutDate to ensure valid range
        const checkin = new Date(checkinDate);
        const checkout = new Date(checkoutDate);

        if (checkout <= checkin) {
            return res.status(400).json({ message: 'Ngày trả phòng phải lớn hơn ngày nhận phòng' });
        }

        const hotels = await Hotel.find({
            'location.city': { $regex: location, $options: 'i' },
            'rooms.availability': { $gte: rooms },  // Ensure there are enough available rooms
            'availableDates': { $gte: checkin, $lte: checkout }
        });

        if (hotels.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách sạn phù hợp' });
        }

        res.json(hotels);
    } catch (error) {
        console.error('Hotel search error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm khách sạn. Vui lòng thử lại sau.' });
    }
});

// Hotel booking endpoint
router.post('/book', async (req, res) => {
    try {
        const { hotelId, checkinDate, checkoutDate, roomType, rooms } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt phòng' });
        }

        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // Lấy thông tin khách sạn
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Khách sạn không tồn tại' });
        }

        // Kiểm tra xem có đủ phòng còn trống không
        const room = hotel.rooms.find(r => r.type === roomType);
        if (!room || room.available < rooms) {
            return res.status(400).json({ message: 'Không đủ phòng trống' });
        }

        // Tính tổng số tiền
        const totalAmount = room.price * rooms;

        // Tạo đơn đặt phòng
        const booking = new Booking({
            user: user._id,
            type: 'hotel',
            status: 'pending',
            totalAmount,
            paymentStatus: 'pending',
            hotel: {
                hotel: hotelId,
                checkinDate,
                checkoutDate,
                rooms: [{ type: roomType, quantity: rooms }]
            }
        });

        await booking.save();

        // Update room availability
        room.available -= rooms;
        await hotel.save();

        res.status(201).json({
            message: 'Đặt phòng thành công',
            booking
        });
    } catch (error) {
        console.error('Hotel booking error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau.' });
    }
});

module.exports = router;
