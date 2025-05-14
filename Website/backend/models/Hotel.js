const mongoose = require('mongoose');
const hotelSchema = new mongoose.Schema({
    name: String,
    location: {
        city: String,
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    description: String,
    rating: Number,
    amenities: [String],
    images: [String],
    rooms: [{
        type: String,
        price: Number,
        capacity: Number,
        available: Number,
        description: String
    }],
    contact: {
        phone: String,
        email: String,
        website: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
