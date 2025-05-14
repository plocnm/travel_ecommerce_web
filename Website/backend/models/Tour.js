const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name: String,
    description: String,
    destination: String,
    duration: {
        days: Number,
        nights: Number
    },
    price: Number,
    included: [String],
    excluded: [String],
    itinerary: [{
        day: Number,
        activities: [String]
    }],
    images: [String],
    maxParticipants: Number,
    currentParticipants: Number,
    departureDates: [{
        date: Date,
        available: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);