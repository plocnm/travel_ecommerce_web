const mongoose = require('mongoose');
const connectDB = require('./serverConnect'); // Assuming serverConnect.js is in the same directory
const Flight = require('./models/Flight'); // Assuming Flight model is in ./models/Flight.js
const path = require('path'); // Add path import
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Specify .env path

// const { MongoClient } = require('mongodb');

// Thay thế bằng chuỗi kết nối MongoDB của bạn
// const uri = 'mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority';

// const client = new MongoClient(uri);

const airports = [
  { city: 'Hanoi', airport: 'Noi Bai International Airport', iata: 'HAN' },
  { city: 'Ho Chi Minh City', airport: 'Tan Son Nhat International Airport', iata: 'SGN' },
  { city: 'Da Nang', airport: 'Da Nang International Airport', iata: 'DAD' },
  { city: 'Nha Trang', airport: 'Cam Ranh International Airport', iata: 'CXR' },
  { city: 'Phu Quoc', airport: 'Phu Quoc International Airport', iata: 'PQC' },
  { city: 'Da Lat', airport: 'Lien Khuong International Airport', iata: 'DLI' },
  { city: 'Hue', airport: 'Phu Bai International Airport', iata: 'HUI' },
  { city: 'Hai Phong', airport: 'Cat Bi International Airport', iata: 'HPH' },
  { city: 'Vinh', airport: 'Vinh International Airport', iata: 'VII' },
  { city: 'Can Tho', airport: 'Can Tho International Airport', iata: 'VCA' },
];

const airlines = ['Vietnam Airlines', 'VietJet Air', 'Bamboo Airways', 'Pacific Airlines'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(getRandomInt(start, end));
}

async function generateFlights() {
  try {
    await connectDB(); // Use connectDB from serverConnect.js
    // await client.connect();
    // const database = client.db('<dbname>'); // Thay thế bằng tên cơ sở dữ liệu của bạn
    // const collection = database.collection('flights');

    console.log('Clearing existing flight data...');
    await Flight.deleteMany({});
    console.log('Existing flight data cleared.');

    const flightsData = [];
    const startDate = new Date('2025-05-16');
    const endDate = new Date('2025-07-16');

    for (let i = 1; i <= 100; i++) {
      const airline = airlines[getRandomInt(0, airlines.length - 1)];
      let departureAirport = airports[getRandomInt(0, airports.length - 1)];
      let arrivalAirport = airports[getRandomInt(0, airports.length - 1)];

      // Đảm bảo sân bay đi và đến không trùng nhau
      while (arrivalAirport.iata === departureAirport.iata) {
        arrivalAirport = airports[getRandomInt(0, airports.length - 1)];
      }

      const departureTime = getRandomDate(startDate, endDate);
      const flightDurationMinutes = getRandomInt(60, 180); // Thời gian bay từ 1 đến 3 giờ
      const arrivalTime = new Date(departureTime.getTime() + flightDurationMinutes * 60000);

      const flight = {
        flightNumber: `FL${String(i).padStart(3, '0')}`,
        airline: airline,
        departure: {
          city: departureAirport.city,
          airport: departureAirport.airport,
          iata: departureAirport.iata,
          time: departureTime,
        },
        arrival: {
          city: arrivalAirport.city,
          airport: arrivalAirport.airport,
          iata: arrivalAirport.iata,
          time: arrivalTime,
        },
        price: getRandomInt(800000, 2000000),
        availableSeats: getRandomInt(50, 180),
        class: Math.random() < 0.8 ? 'economy' : 'business',
        status: 'scheduled', // Default status
      };

      flightsData.push(flight);
    }

    // const result = await collection.insertMany(flights);
    const result = await Flight.create(flightsData);
    console.log(`${result.length} chuyến bay đã được chèn vào cơ sở dữ liệu.`);
    // console.log(`${result.insertedCount} chuyến bay đã được chèn vào cơ sở dữ liệu.`);
  } catch (error) {
    console.error('Lỗi khi chèn dữ liệu:', error);
    process.exit(1); // Exit with error code
  } finally {
    // await client.close();
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0); // Exit successfully
  }
}

generateFlights(); 