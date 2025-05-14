const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['flight', 'hotel', 'tour'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'wallet'],
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    // Flight booking specific fields
    flight: {
        flight: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Flight'
        },
        passengers: [{
            name: String,
            age: Number,
            passport: String
        }],
        class: String,
        seats: [String]
    },
    // Hotel booking specific fields
    hotel: {
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel'
        },
        checkIn: Date,
        checkOut: Date,
        rooms: [{
            type: {
                type: String,
                enum: ['single', 'double', 'suite', 'deluxe'],
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            guests: [{
                name: String,
                age: Number
            }]
        }]
    },
    // Tour booking specific fields
    tour: {
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour'
        },
        departureDate: Date,
        participants: [{
            name: String,
            age: Number,
            passport: String
        }],
        specialRequests: String
    },
    cancellationReason: String,
    refundAmount: Number,
    refundStatus: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending'
    }
});

// Add indexes for better query performance
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ type: 1, status: 1 });
bookingSchema.index({ 'flight.flight': 1 });
bookingSchema.index({ 'hotel.hotel': 1 });
bookingSchema.index({ 'tour.tour': 1 });

module.exports = mongoose.model('Booking', bookingSchema); 