const mongoose = require('mongoose');
const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true },
    airline: String,
    departure: {
        city: String,
        airport: String,
        time: Date
    },
    arrival: {
        city: String,
        airport: String,
        time: Date
    },
    price: Number,
    availableSeats: Number,
    class: String
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
