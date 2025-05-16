const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Assuming your Booking model is here
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware
const Tour = require('../models/Tour'); // Assuming your Tour model is here
const User = require('../models/User'); // Import User model

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

// GET a single booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email') // Populate user details
            // Example populates (uncomment if needed for edit view)
            // .populate('flight.flight')
            // .populate('hotel.hotel')
            // .populate('tour.tour');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        console.error('Error fetching booking by ID:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found (Invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});

// PUT (update) a booking by ID
router.put('/:id', authMiddleware, async (req, res) => {
    const { status, paymentStatus /* other fields like totalAmount, etc. */ } = req.body;
    const { id } = req.params;

    try {
        let booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Add role-based authorization if needed (e.g., only admin can update)
        // if (req.user.role !== 'admin') {
        //    return res.status(403).json({ msg: 'User not authorized' });
        // }

        const updateFields = {};
        if (status) updateFields.status = status;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;
        // Add other fields from req.body to updateFields if they are present and valid

        booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true } // Return updated doc and run schema validators
        ).populate('user', 'name email');

        res.json(booking);
    } catch (err) {
        console.error('Error updating booking:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found (Invalid ID)' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// DELETE a booking by ID
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Add role-based authorization if needed
        // if (req.user.role !== 'admin') {
        //    return res.status(403).json({ msg: 'User not authorized' });
        // }

        await Booking.findByIdAndDelete(id);

        res.json({ msg: 'Booking removed successfully' });
    } catch (err) {
        console.error('Error deleting booking:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found (Invalid ID)' });
        }
        res.status(500).send('Server Error');
    }
});

// POST: Đặt tour mới
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { tour, quantity, date, paymentMethod } = req.body; // Added paymentMethod

        // Basic validation
        if (!tour || !quantity || !date || !paymentMethod) {
            return res.status(400).json({ message: "Thiếu thông tin đặt tour (tour, quantity, date, paymentMethod required)" });
        }

        const tourDetails = await Tour.findById(tour);
        if (!tourDetails) {
            return res.status(404).json({ message: "Không tìm thấy tour" });
        }

        const totalAmount = tourDetails.price * quantity;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newBooking = new Booking({
            user: req.user.userId,
            type: 'tour',
            tour: {
                tour: tour,
                departureDate: new Date(date),
                // participants: req.body.participants || [], // Example
                // specialRequests: req.body.specialRequests || '' // Example
            },
            totalAmount: totalAmount,
            paymentMethod: paymentMethod, // Use provided paymentMethod
        });

        if (user.balance >= totalAmount) {
            user.balance -= totalAmount;
            await user.save();
            newBooking.paymentStatus = 'paid';
            newBooking.status = 'confirmed';
        } else {
            newBooking.paymentStatus = 'pending';
            newBooking.status = 'pending';
            // Set payment deadline to 24 hours from now
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24);
            newBooking.paymentDeadline = deadline;
        }

        await newBooking.save();
        // Send a more detailed response, especially if payment is pending
        if (newBooking.paymentStatus === 'pending') {
            res.status(201).json({
                booking: newBooking,
                message: 'Booking created, payment pending. Please complete payment within 24 hours.',
                redirectToPayment: true // Indicate frontend to redirect
            });
        } else {
            res.status(201).json({
                booking: newBooking,
                message: 'Booking confirmed and paid successfully.',
                redirectToPayment: false
            });
        }

    } catch (err) {
        console.error('Lỗi khi lưu booking:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi server khi đặt tour" });
    }
});

module.exports = router; 