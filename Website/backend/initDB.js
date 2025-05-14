const mongoose = require('mongoose');
const connectDB = require('./serverConnect');
const User = require('./models/User');
const Flight = require('./models/Flight');
const Hotel = require('./models/Hotel');
const Tour = require('./models/Tour');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

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
            Booking.deleteMany({}),
            Review.deleteMany({})
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

        // Create hotels for tour packages
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
            },
            {
                name: 'Sapa Jade Hill Resort',
                location: {
                    city: 'SaPa',
                    address: 'SaPa, Lào Cai',
                    coordinates: {
                        latitude: 22.3374,
                        longitude: 103.8444
                    }
                },
                description: 'Resort cao cấp với view núi rừng Tây Bắc',
                rating: 4.7,
                amenities: ['WiFi', 'Bể bơi', 'Spa', 'Nhà hàng', 'Gym'],
                images: ['images/hotels/sapa-jade.jpg'],
                rooms: [
                    {
                        type: 'deluxe',
                        price: 1800000,
                        capacity: 2,
                        available: 15,
                        description: 'Phòng Deluxe với view núi'
                    }
                ],
                contact: {
                    phone: '+84 214 377 8888',
                    email: 'info@sapajadehill.com',
                    website: 'www.sapajadehill.com'
                }
            },
            {
                name: 'Sheraton Nha Trang',
                location: {
                    city: 'Nha Trang',
                    address: 'Nha Trang, Khánh Hòa',
                    coordinates: {
                        latitude: 12.2388,
                        longitude: 109.1967
                    }
                },
                description: 'Khách sạn 5 sao ven biển Nha Trang',
                rating: 4.9,
                amenities: ['WiFi', 'Bể bơi', 'Spa', 'Nhà hàng', 'Gym', 'Bãi biển riêng'],
                images: ['images/hotels/sheraton-nhatrang.jpg'],
                rooms: [
                    {
                        type: 'deluxe',
                        price: 2200000,
                        capacity: 2,
                        available: 25,
                        description: 'Phòng Deluxe với view biển'
                    }
                ],
                contact: {
                    phone: '+84 258 388 0000',
                    email: 'info@sheratonnhatrang.com',
                    website: 'www.sheratonnhatrang.com'
                }
            },
            {
                name: 'Melia Buôn Ma Thuột',
                location: {
                    city: 'Buôn Ma Thuột',
                    address: 'Buôn Ma Thuột, Đắk Lắk',
                    coordinates: {
                        latitude: 12.6797,
                        longitude: 108.0377
                    }
                },
                description: 'Khách sạn 5 sao tại trung tâm Tây Nguyên',
                rating: 4.6,
                amenities: ['WiFi', 'Bể bơi', 'Spa', 'Nhà hàng', 'Gym'],
                images: ['images/hotels/melia-buonmathuot.jpg'],
                rooms: [
                    {
                        type: 'deluxe',
                        price: 1500000,
                        capacity: 2,
                        available: 18,
                        description: 'Phòng Deluxe với view thành phố'
                    }
                ],
                contact: {
                    phone: '+84 262 385 8888',
                    email: 'info@meliabuonmathuot.com',
                    website: 'www.meliabuonmathuot.com'
                }
            }
        ]);

        // Create tour packages
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
            },
            {
                name: 'COMBO SaPa',
                description: 'Tour SaPa trọn gói 4 Ngày 3 Đêm bao gồm vé máy bay, khách sạn, ăn uống và các hoạt động tham quan',
                destination: 'SaPa',
                duration: {
                    days: 4,
                    nights: 3
                },
                price: 6598000,
                included: ['Vé máy bay', 'Khách sạn', 'Ăn uống', 'Hoạt động tham quan', 'Hướng dẫn viên'],
                excluded: ['Chi phí cá nhân'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Đón sân bay', 'Check-in khách sạn', 'Ăn trưa', 'Tham quan thị trấn SaPa']
                    },
                    {
                        day: 2,
                        activities: ['Ăn sáng', 'Tham quan Fansipan', 'Ăn trưa', 'Tham quan làng Cát Cát']
                    },
                    {
                        day: 3,
                        activities: ['Ăn sáng', 'Tham quan thác Bạc', 'Ăn trưa', 'Tham quan làng Tả Phìn']
                    },
                    {
                        day: 4,
                        activities: ['Ăn sáng', 'Tham quan chợ SaPa', 'Ăn trưa', 'Tiễn sân bay']
                    }
                ],
                images: ['images/sapa.png'],
                maxParticipants: 20,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-04-20'),
                        available: 20
                    }
                ]
            },
            {
                name: 'COMBO Nha Trang',
                description: 'Tour Nha Trang trọn gói 3 Ngày 2 Đêm bao gồm vé máy bay, khách sạn, ăn uống và các hoạt động tham quan',
                destination: 'Nha Trang',
                duration: {
                    days: 3,
                    nights: 2
                },
                price: 5998000,
                included: ['Vé máy bay', 'Khách sạn', 'Ăn uống', 'Hoạt động tham quan', 'Hướng dẫn viên'],
                excluded: ['Chi phí cá nhân'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Đón sân bay', 'Check-in khách sạn', 'Ăn trưa', 'Tham quan đảo']
                    },
                    {
                        day: 2,
                        activities: ['Ăn sáng', 'Lặn biển', 'Ăn trưa', 'Tham quan Vinpearl']
                    },
                    {
                        day: 3,
                        activities: ['Ăn sáng', 'Tham quan Tháp Bà', 'Ăn trưa', 'Tiễn sân bay']
                    }
                ],
                images: ['images/nhatrang.png'],
                maxParticipants: 20,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-04-25'),
                        available: 20
                    }
                ]
            },
            {
                name: 'COMBO Tây Nguyên',
                description: 'Tour Tây Nguyên trọn gói 3N2Đ + Teambuilding + Gala Dinner',
                destination: 'Tây Nguyên',
                duration: {
                    days: 3,
                    nights: 2
                },
                price: 6998000,
                included: ['Vé máy bay', 'Khách sạn', 'Ăn uống', 'Hoạt động tham quan', 'Hướng dẫn viên', 'Teambuilding', 'Gala Dinner'],
                excluded: ['Chi phí cá nhân'],
                itinerary: [
                    {
                        day: 1,
                        activities: ['Đón sân bay', 'Check-in khách sạn', 'Ăn trưa', 'Tham quan Buôn Ma Thuột']
                    },
                    {
                        day: 2,
                        activities: ['Ăn sáng', 'Teambuilding', 'Ăn trưa', 'Tham quan thác Dray Nur']
                    },
                    {
                        day: 3,
                        activities: ['Ăn sáng', 'Gala Dinner', 'Ăn trưa', 'Tiễn sân bay']
                    }
                ],
                images: ['images/taynguyen.png'],
                maxParticipants: 20,
                currentParticipants: 0,
                departureDates: [
                    {
                        date: new Date('2024-05-01'),
                        available: 20
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