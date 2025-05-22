const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET /api/statistics
router.get('/', verifyAdmin, async (req, res) => {
    try {
        // Tổng số tour
        const totalTours = await Tour.countDocuments();
        // Tổng số booking
        const totalBookings = await Booking.countDocuments();
        // Tổng số user
        const totalUsers = await User.countDocuments();
        // Tổng doanh thu
        const bookings = await Booking.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        // Tổng số review
        const totalReviews = await Review.countDocuments();
        // Rating trung bình
        const avgRatingAgg = await Review.aggregate([
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);
        const avgRating = avgRatingAgg[0]?.avg ? Number(avgRatingAgg[0].avg.toFixed(2)) : 0;

        // Top 5 tour bán chạy
        const topToursAgg = await Booking.aggregate([
            { $match: { 'tour.tour': { $exists: true } } },
            { $group: {
                _id: "$tour.tour",
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }},
            { $sort: { bookings: -1 } },
            { $limit: 5 }
        ]);
        // Lấy tên tour
        const topTours = await Promise.all(topToursAgg.map(async t => {
            const tour = await Tour.findById(t._id);
            return {
                name: tour ? tour.name : 'Unknown',
                bookings: t.bookings,
                revenue: t.revenue
            };
        }));

        // Top 5 khách hàng
        const topCustomersAgg = await Booking.aggregate([
            { $match: { user: { $exists: true } } },
            { $group: {
                _id: "$user",
                bookings: { $sum: 1 },
                totalSpent: { $sum: "$totalAmount" }
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 5 }
        ]);
        const topCustomers = await Promise.all(topCustomersAgg.map(async c => {
            const user = await User.findById(c._id);
            return {
                name: user ? user.name : 'Unknown',
                email: user ? user.email : '',
                bookings: c.bookings,
                totalSpent: c.totalSpent
            };
        }));

        res.json({
            totalTours,
            totalBookings,
            totalUsers,
            totalRevenue,
            totalReviews,
            avgRating,
            topTours,
            topCustomers
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router; 