const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id; // Assuming authMiddleware adds user to req

    try {
        // Check if the booking exists and belongs to the user or if user is admin
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Optionally, add more checks: e.g., booking status is 'confirmed', payment is 'paid'
        // and that the booking user is the one leaving the review (unless an admin is allowed to)
        if (booking.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized to review this booking' });
        }
        
        // Check if a review already exists for this booking
        let existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ msg: 'Review already submitted for this booking' });
        }

        const newReview = new Review({
            user: userId,
            booking: bookingId,
            rating,
            comment
        });

        const review = await newReview.save();
        res.status(201).json(review);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
});

// Additional routes for GET (all reviews, by booking, by user), PUT, DELETE can be added here.

module.exports = router; 