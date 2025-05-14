// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Yêu cầu đăng nhập cho tất cả route booking
router.use(authMiddleware.verifyToken);

// GET /api/bookings - Lấy tất cả booking (admin hoặc theo user)
router.get('/', bookingController.getAllBookings);

// GET /api/bookings/:id - Lấy chi tiết 1 booking
router.get('/:id', bookingController.getBookingById);

// POST /api/bookings - Tạo booking mới
router.post('/', bookingController.createBooking);

// PATCH /api/bookings/:id/cancel - Hủy booking
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;