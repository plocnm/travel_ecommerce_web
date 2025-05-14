const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    airline: {
        type: String,
        required: true
    },
    departure: {
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    arrival: {
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    price: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    class: {
        type: String,
        enum: ['economy', 'business', 'first'],
        default: 'economy'
    },
    status: {
        type: String,
        enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
        default: 'scheduled'
    }
});

module.exports = mongoose.model('Flight', flightSchema); 