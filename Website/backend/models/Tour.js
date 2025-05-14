const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    duration: {
        days: {
            type: Number,
            required: true
        },
        nights: {
            type: Number,
            required: true
        }
    },
    price: {
        type: Number,
        required: true
    },
    included: [{
        type: String
    }],
    excluded: [{
        type: String
    }],
    itinerary: [{
        day: Number,
        activities: [String]
    }],
    images: [{
        type: String
    }],
    maxParticipants: {
        type: Number,
        required: true
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    departureDates: [{
        date: Date,
        available: Number
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold-out'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema); 