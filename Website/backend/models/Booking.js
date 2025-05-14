const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['flight', 'hotel', 'tour'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    totalAmount: Number,
    paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    paymentMethod: String,
    flight: {
        flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
        passengers: [{
            name: String,
            age: Number,
            passport: String
        }],
        class: String,
        seats: [String]
    },
    hotel: {
        hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
        checkIn: Date,
        checkOut: Date,
        rooms: [{
            type: String,
            quantity: Number,
            guests: [{
                name: String,
                age: Number
            }]
        }]
    },
    tour: {
        tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
        participants: [{
            name: String,
            age: Number
        }],
        date: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
