// server.js
require('dotenv').config();
//console.log('✅ MONGODB_URI =', process.env.MONGODB_URI);

const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configuration for backend
const config = {
    backend: {
        port: 5500,
        path: __dirname
    }
};

// Khởi tạo app
const app = express();
connectDB();
app.use(express.json());

// Giới hạn tốc độ request (nếu có cấu hình trong .env)
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, please try again later.'
}));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route to handle root path
app.get('/', (req, res) => {
  res.send('Welcome to the Travel E-commerce API!');
});

// Mount các route (temporarily commented out for debugging)
/*
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/flights', require('./routes/flight.routes'));
app.use('/api/hotels', require('./routes/hotel.routes'));
app.use('/api/tours', require('./routes/tour.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
*/

// Fallback route to serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.HTML'));
});

// Middleware xử lý lỗi cuối cùng
app.use(errorHandler);

// Start the backend server as usual
const PORT = process.env.PORT || config.backend.port;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`Frontend served from the same port, accessible at http://localhost:${PORT}/index.HTML or other frontend paths.`);
});
