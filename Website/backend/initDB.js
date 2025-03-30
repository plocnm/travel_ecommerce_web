const mongoose = require('mongoose');
const connectDB = require('./serverConnect');
const User = require('./models/User');
const Flight = require('./models/Flight');
const Hotel = require('./models/Hotel');
const Tour = require('./models/Tour');
const Booking = require('./models/Booking');

const initializeDB = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Flight.deleteMany({}),
            Hotel.deleteMany({}),
            Tour.deleteMany({}),
            Booking.deleteMany({})
        ]);

        // Create sample users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '1234567890',
                role: 'admin'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'user123',
                phone: '9876543210',
                role: 'user'
            }
        ]);

        // Create sample flights
        const flights = await Flight.create([
            {
                flightNumber: 'FL001',
                airline: 'Vietnam Airlines',
                departure: {
                    city: 'Ho Chi Minh City',
                    airport: 'Tan Son Nhat International Airport',
                    time: new Date('2024-04-01T10:00:00Z')
                },
                arrival: {
                    city: 'Hanoi',
                    airport: 'Noi Bai International Airport',
                    time: new Date('2024-04-01T12:00:00Z')
                },
                price: 1500000,
                availableSeats: 100,
                class: 'economy'
            },
            {
                flightNumber: 'FL002',
                airline: 'Vietnam Airlines',
                departure: {
                    city: 'Hanoi',
                    airport: 'Noi Bai International Airport',
                    time: new Date('2024-04-02T14:00:00Z')
                },
                arrival: {
                    city: 'Da Nang',
                    airport: 'Da Nang International Airport',
                    time: new Date('2024-04-02T15:30:00Z')
                },
                price: 1200000,
                availableSeats: 80,
                class: 'economy'
            }
        ]);

        // Create sample hotels
        const hotels = await Hotel.create([
            {
                name: 'Grand Hotel Saigon',
                location: {
                    city: 'Ho Chi Minh City',
                    address: '8 Dong Khoi Street, District 1',
                    coordinates: {
                        latitude: 10.7769,
                        longitude: 106.7009
                    }
                },
                description: 'Luxury hotel in the heart of Ho Chi Minh City',
                rating: 4.5,
                amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
                images: ['hotel1.jpg', 'hotel2.jpg'],
                rooms: [
                    {
                        type: 'deluxe',
                        price: 2000000,
                        capacity: 2,
                        available: 10,
                        description: 'Deluxe room with city view'
                    }
                ],
                contact: {
                    phone: '+84 28 3824 5555',
                    email: 'info@grandhotelsaigon.com',
                    website: 'www.grandhotelsaigon.com'
                }
            },
            {
                name: 'Hanoi Imperial Hotel',
                location: {
                    city: 'Hanoi',
                    address: '44 Hang Bai Street, Hoan Kiem District',
                    coordinates: {
                        latitude: 21.0285,
                        longitude: 105.8542
                    }
                },
                description: 'Classic luxury hotel in Hanoi',
                rating: 4.8,
                amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
                images: ['hotel3.jpg', 'hotel4.jpg'],
                rooms: [
                    {
                        type: 'suite',
                        price: 3000000,
                        capacity: 3,
                        available: 5,
                        description: 'Executive suite with river view'
                    }
                ],
                contact: {
                    phone: '+84 24 3933 3888',
                    email: 'info@hanoiimperial.com',
                    website: 'www.hanoiimperial.com'
                }
            }
        ]);

        // Create sample tours
        const tours = await Tour.create([
            {
                name: 'Ha Long Bay Cruise',
                description: '3-day cruise through the stunning Ha Long Bay',
                destination: 'Ha Long Bay',
                duration: {
                    days: 3,
                    nights: 2
                },
                price: 5000000,
                included: ['Cruise', 'Meals', 'Activities', 'Guide'],
                excluded: ['Airfare', 'Personal expenses'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Pickup from Hanoi', 'Transfer to Ha Long Bay', 'Check-in and welcome dinner']
                    },
                    {
                        day: 2,
                        activities: ['Kayaking', 'Cave exploration', 'Swimming']
                    },
                    {
                        day: 3,
                        activities: ['Sunrise Tai Chi', 'Breakfast', 'Return to Hanoi']
                    }
                ],
                images: ['tour1.jpg', 'tour2.jpg'],
                maxParticipants: 20,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-04-15'),
                        available: 20
                    }
                ]
            },
            {
                name: 'Hoi An Cultural Tour',
                description: 'Explore the ancient town of Hoi An',
                destination: 'Hoi An',
                duration: {
                    days: 2,
                    nights: 1
                },
                price: 3000000,
                included: ['Hotel', 'Meals', 'Guide', 'Activities'],
                excluded: ['Airfare', 'Personal expenses'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Old Town walking tour', 'Lantern making workshop', 'Evening food tour']
                    },
                    {
                        day: 2,
                        activities: ['Countryside cycling', 'Cooking class', 'Return to Da Nang']
                    }
                ],
                images: ['tour3.jpg', 'tour4.jpg'],
                maxParticipants: 15,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-04-20'),
                        available: 15
                    }
                ]
            }
        ]);

        // Create sample bookings
        await Booking.create([
            {
                user: users[1]._id,
                type: 'flight',
                status: 'confirmed',
                totalAmount: 1500000,
                paymentStatus: 'paid',
                paymentMethod: 'credit_card',
                flight: {
                    flight: flights[0]._id,
                    passengers: [
                        {
                            name: 'John Doe',
                            age: 30,
                            passport: 'P123456789'
                        }
                    ],
                    class: 'economy',
                    seats: ['12A']
                }
            },
            {
                user: users[1]._id,
                type: 'hotel',
                status: 'pending',
                totalAmount: 4000000,
                paymentStatus: 'pending',
                paymentMethod: 'bank_transfer',
                hotel: {
                    hotel: hotels[0]._id,
                    checkIn: new Date('2024-04-10'),
                    checkOut: new Date('2024-04-12'),
                    rooms: [
                        {
                            type: 'deluxe',
                            quantity: 1,
                            guests: [
                                {
                                    name: 'John Doe',
                                    age: 30
                                }
                            ]
                        }
                    ]
                }
            }
        ]);

        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initializeDB(); 