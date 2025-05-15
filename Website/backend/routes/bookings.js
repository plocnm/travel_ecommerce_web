const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Assuming your Booking model is here
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware
const Tour = require('../models/Tour'); // Assuming your Tour model is here

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

// GET a single booking by ID (newly added)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email') // Populate user details
            // Add other populates if needed, e.g., for flight, hotel, tour details
            // .populate('flight.flight', 'flightNumber airline')
            // .populate('hotel.hotel', 'name location.city')
            // .populate('tour.tour', 'name destination');

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

// Placeholder for PUT (update) a booking
router.put('/:id', authMiddleware, async (req, res) => {
    const { status, paymentStatus /* other fields to update */ } = req.body;
    const { id } = req.params;

    try {
        let booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check if the user is authorized to update (e.g., an admin or the booking owner)
        // For admin, typically role check is done in authMiddleware or here
        // For now, assuming admin has rights if middleware passed

        const updateFields = {};
        if (status) updateFields.status = status;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;
        // Add other fields as necessary
        // Example: if (req.body.totalAmount) updateFields.totalAmount = req.body.totalAmount;


        booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } // Return the updated document
        ).populate('user', 'name email');

        res.json(booking);
    } catch (err) {
        console.error('Error updating booking:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found (Invalid ID)' });
        }
        res.status(500).send('Server Error');
    }
});

// Placeholder for DELETE a booking
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Authorization check (e.g., admin or owner)
        // For now, assuming admin has rights if middleware passed

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
        const { tour, quantity, date } = req.body;

        if (!tour || !quantity || !date) {
            return res.status(400).json({ message: "Thiếu thông tin đặt tour" });
        }

        // Find the tour to get its price and details for totalAmount calculation
        const tourDetails = await Tour.findById(tour);
        if (!tourDetails) {
            return res.status(404).json({ message: "Không tìm thấy tour" });
        }

        // Calculate total amount based on tour price and quantity
        const totalAmount = tourDetails.price * quantity;

        const newBooking = new Booking({
            user: req.user.userId,  // authMiddleware phải gán req.user.userId
            type: 'tour', // Specify booking type as tour
            tour: { // Structure data according to Booking model schema
                tour: tour, // tour ID
                departureDate: new Date(date), // Convert date string to Date object
                // participants can be added here if collected from frontend
                // specialRequests can be added here if collected from frontend
            },
            totalAmount: totalAmount,
            // paymentMethod and paymentStatus should ideally be handled after payment initiation
            // For now, setting default or requiring in request body if simple payment flow
            // Example: paymentMethod: req.body.paymentMethod,
            // paymentStatus: 'pending' // Default status
            paymentMethod: req.body.paymentMethod || 'bank_transfer' // Assuming a default or required in body
        });

        // Basic validation for quantity against tour capacity if needed
        // Note: A more robust implementation would handle concurrent bookings
        // if (tourDetails.maxParticipants !== undefined && (tourDetails.currentParticipants + quantity) > tourDetails.maxParticipants) {
        //     return res.status(400).json({ message: "Số lượng người vượt quá sức chứa của tour" });
        // }

        await newBooking.save();

        // Optional: Update currentParticipants in Tour model
        // tourDetails.currentParticipants += quantity;
        // await tourDetails.save();

        res.status(201).json(newBooking);
    } catch (err) {
        console.error('Lỗi khi lưu booking:', err.message);
        res.status(500).json({ message: "Lỗi server khi đặt tour" });
    }
});

module.exports = router; 