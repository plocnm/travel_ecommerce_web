const Booking = require('../models/Booking');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const Tour = require('../models/Tour');

/**
 * Tạo một booking mới
 */
const createBooking = async (bookingData) => {
  const newBooking = new Booking(bookingData);
  return await newBooking.save();
};

/**
 * Lấy tất cả booking của người dùng (hoặc tất cả nếu là admin)
 */
const getBookings = async (userId, isAdmin = false) => {
  if (isAdmin) {
    return await Booking.find().populate('user');
  } else {
    return await Booking.find({ user: userId });
  }
};

/**
 * Lấy chi tiết một booking cụ thể
 */
const getBookingById = async (bookingId) => {
  return await Booking.findById(bookingId).populate('user');
};

/**
 * Hủy một booking
 */
const cancelBooking = async (bookingId) => {
  return await Booking.findByIdAndUpdate(bookingId, {
    status: 'cancelled',
    paymentStatus: 'refunded'
  }, { new: true });
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
