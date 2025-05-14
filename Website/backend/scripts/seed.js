const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

const initializeDB = async () => {
    try {
        await connectDB();

        await Promise.all([
            User.deleteMany({}),
            Flight.deleteMany({}),
            Hotel.deleteMany({}),
            Tour.deleteMany({}),
            Booking.deleteMany({})
        ]);

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

        const hotels = await Hotel.create([
            {
                name: 'Vinpearl Resort Hạ Long',
                location: {
                    city: 'Hạ Long',
                    address: 'Hạ Long, Quảng Ninh',
                    coordinates: {
                        latitude: 20.9101,
                        longitude: 107.1839
                    }
                },
                description: 'Khách sạn 5 sao với view vịnh Hạ Long tuyệt đẹp',
                rating: 4.8,
                amenities: ['WiFi', 'Bể bơi', 'Spa', 'Nhà hàng', 'Gym'],
                images: ['images/hotels/vinpearl-halong.jpg'],
                rooms: [
                    {
                        type: 'deluxe',
                        price: 2500000,
                        capacity: 2,
                        available: 20,
                        description: 'Phòng Deluxe với view vịnh'
                    }
                ],
                contact: {
                    phone: '+84 203 384 8888',
                    email: 'info@vinpearlhalong.com',
                    website: 'www.vinpearl.com/halong'
                }
            }
        ]);

        const tours = await Tour.create([
            {
                name: 'COMBO Hạ Long Bay',
                description: 'Tour Hạ Long trọn gói 3 Ngày 2 Đêm bao gồm vé máy bay, khách sạn, ăn uống và các hoạt động tham quan',
                destination: 'Hạ Long Bay',
                duration: {
                    days: 3,
                    nights: 2
                },
                price: 4598000,
                included: ['Vé máy bay', 'Khách sạn', 'Ăn uống', 'Hoạt động tham quan', 'Hướng dẫn viên'],
                excluded: ['Chi phí cá nhân'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Đón sân bay', 'Check-in khách sạn', 'Ăn trưa', 'Tham quan vịnh Hạ Long']
                    },
                    {
                        day: 2,
                        activities: ['Ăn sáng', 'Chèo thuyền kayak', 'Tham quan hang động', 'Ăn tối']
                    },
                    {
                        day: 3,
                        activities: ['Ăn sáng', 'Tham quan làng chài', 'Ăn trưa', 'Tiễn sân bay']
                    }
                ],
                images: ['images/halong-bay.png'],
                maxParticipants: 20,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-04-15'),
                        available: 20
                    }
                ]
            }
        ]);

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
