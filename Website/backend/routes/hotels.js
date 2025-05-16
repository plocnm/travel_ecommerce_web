const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getLocationDetails, searchNearbyHotels } = require('../utils/ipGeolocation');

// Hotel search endpoint
router.get('/search', async (req, res) => {
    try {
        const { location, checkinDate, checkoutDate, rooms } = req.query;
        
        // Map normalized location names to their Vietnamese equivalents
        const locationMap = {
            'hanoi': 'Hà Nội',
            'ha noi': 'Hà Nội',
            'hn': 'Hà Nội',
            'hochiminh': 'Hồ Chí Minh',
            'ho chi minh': 'Hồ Chí Minh',
            'hcm': 'Hồ Chí Minh',
            'saigon': 'Hồ Chí Minh',
            'danang': 'Đà Nẵng',
            'da nang': 'Đà Nẵng',
            'dalat': 'Đà Lạt',
            'da lat': 'Đà Lạt',
            'hue': 'Huế',
            'nhatrang': 'Nha Trang',
            'nha trang': 'Nha Trang',
            'phuquoc': 'Phú Quốc',
            'phu quoc': 'Phú Quốc',
            'sapa': 'Sapa'
        };

        // Function to normalize Vietnamese text
        const normalizeText = (text) => {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/\s+/g, '');
        };

        // Get the Vietnamese city name from the normalized location
        const normalizedInput = normalizeText(location);
        const vietnameseCity = locationMap[normalizedInput] || location;

        console.log('Search parameters:', {
            originalLocation: location,
            normalizedInput,
            vietnameseCity,
            checkinDate,
            checkoutDate,
            rooms
        });

        // 1. Search in database
        const dbHotels = await Hotel.find({
            $or: [
                { 'location.city': { $regex: vietnameseCity, $options: 'i' } },
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.city': { $regex: normalizedInput, $options: 'i' } }
            ],
            status: 'active'
        });

        // 2. Get location details from IPGeolocation API
        const locationDetails = await getLocationDetails(vietnameseCity);
        let apiHotels = [];

        if (locationDetails && locationDetails.latitude && locationDetails.longitude) {
            const nearbyHotels = await searchNearbyHotels(
                locationDetails.latitude,
                locationDetails.longitude
            );

            if (nearbyHotels && nearbyHotels.places) {
                apiHotels = nearbyHotels.places.map(place => ({
                    _id: `api_${place.id}`,
                    name: place.name,
                    location: {
                        city: vietnameseCity,
                        address: place.address,
                        coordinates: {
                            latitude: place.latitude,
                            longitude: place.longitude
                        }
                    },
                    description: place.description || 'No description available',
                    rating: place.rating || 0,
                    amenities: place.amenities || [],
                    images: place.images || [],
                    rooms: [{
                        type: 'standard',
                        price: place.price || 0,
                        capacity: 2,
                        available: 1,
                        description: 'Standard room'
                    }],
                    contact: {
                        phone: place.phone || '',
                        website: place.website || ''
                    },
                    status: 'active',
                    source: 'api'
                }));
            }
        }

        // Combine and filter results
        const allHotels = [...dbHotels, ...apiHotels];
        const availableHotels = allHotels.filter(hotel => {
            return hotel.rooms.some(room => room.available >= parseInt(rooms));
        });

        console.log(`Found ${availableHotels.length} hotels (${dbHotels.length} from DB, ${apiHotels.length} from API)`);

        res.json(availableHotels);
    } catch (error) {
        console.error('Hotel search error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm khách sạn. Vui lòng thử lại sau.' });
    }
});

// Hotel booking endpoint
router.post('/book', async (req, res) => {
    try {
        const { hotelId, checkinDate, checkoutDate, rooms, guests } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt phòng' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // Get hotel details
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Khách sạn không tồn tại' });
        }

        // Calculate total amount
        const totalAmount = rooms.reduce((sum, room) => {
            const hotelRoom = hotel.rooms.find(r => r.type === room.type);
            return sum + (hotelRoom.price * room.quantity);
        }, 0);

        // Create booking
        const booking = new Booking({
            user: user._id,
            type: 'hotel',
            totalAmount,
            paymentMethod: 'credit_card', // Default payment method
            hotel: {
                hotel: hotelId,
                checkIn: new Date(checkinDate),
                checkOut: new Date(checkoutDate),
                rooms: rooms.map(room => ({
                    type: room.type,
                    quantity: room.quantity,
                    guests: room.guests
                }))
            }
        });

        if (user.balance >= totalAmount) {
            user.balance -= totalAmount;
            await user.save();
            // Potentially update hotel room availability here
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
            res.status(201).json({
                booking,
                message: 'Đặt phòng thành công và đã thanh toán.',
                redirectToPayment: false
            });
        } else {
            booking.paymentStatus = 'pending';
            booking.status = 'pending';
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24);
            booking.paymentDeadline = deadline;
            await booking.save();
            // Room availability should be handled carefully, perhaps with a temporary reservation system
            res.status(201).json({
                booking,
                message: 'Đặt phòng thành công. Vui lòng thanh toán trong vòng 24 giờ.',
                redirectToPayment: true
            });
        }
    } catch (error) {
        console.error('Hotel booking error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau.' });
    }
});

module.exports = router; 