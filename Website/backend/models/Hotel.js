const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    rooms: [{
        type: {
            type: String,
            enum: ['single', 'double', 'suite', 'deluxe'],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        available: {
            type: Number,
            required: true
        },
        description: String
    }],
    contact: {
        phone: String,
        email: String,
        website: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    }
});

module.exports = mongoose.model('Hotel', hotelSchema); 