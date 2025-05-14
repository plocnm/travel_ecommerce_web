// controllers/booking.controller.js
const bookingService = require('../services/booking.service');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const bookings = await bookingService.getBookings(req.user.id, isAdmin);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const cancelled = await bookingService.cancelBooking(req.params.id);
    res.status(200).json({ message: 'Booking cancelled', cancelled });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking
};
