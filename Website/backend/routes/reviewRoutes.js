const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middleware/authMiddleware'); // Correctly import authMiddleware

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { bookingId, rating, comment, type } = req.body;

        // Check if user has already reviewed this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        const review = new Review({
            user: req.user.userId,
            booking: bookingId,
            rating,
            comment,
            type
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Error creating review' });
    }
});

// Get reviews for a specific booking
router.get('/booking/:bookingId', async (req, res) => {
    try {
        const review = await Review.findOne({ booking: req.params.bookingId })
            .populate('user', 'name');
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review' });
    }
});

// Get all reviews by a user
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('booking')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// Update a review
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findOne({ _id: req.params.id, user: req.user.id });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

// Additional routes for GET (all reviews, by booking, by user), PUT, DELETE can be added here.

module.exports = router; 