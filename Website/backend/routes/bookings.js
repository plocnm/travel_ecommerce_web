const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Assuming your Booking model is here
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// GET all bookings (protected by auth middleware)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch bookings and populate user details, if 'user' is a ref to 'User' model
        // and you want to send back user's name or other details.
        // If 'user' field in Booking model only stores user ID and you don't need to populate,
        // you can remove .populate('user')
        const bookings = await Booking.find().populate('user', 'name email'); // Populate user with name and email
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.userId })
            .populate('flight.flight', 'flightNumber airline departure arrival price') // Populate flight details
            .populate('hotel.hotel', 'name location.city') // Populate hotel details
            .populate('tour.tour', 'name destination price') // Populate tour details
            .sort({ bookingDate: -1 }); // Sort by booking date, newest first
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching user bookings:', err.message);
        res.status(500).send('Server Error');
    }
});

// Placeholder for PUT (update) a booking
router.put('/:id', authMiddleware, async (req, res) => {
    // TODO: Implement booking update logic
    res.status(501).json({ msg: 'Update booking not implemented' });
});

// Placeholder for DELETE a booking
router.delete('/:id', authMiddleware, async (req, res) => {
    // TODO: Implement booking deletion logic
    res.status(501).json({ msg: 'Delete booking not implemented' });
});

module.exports = router; 