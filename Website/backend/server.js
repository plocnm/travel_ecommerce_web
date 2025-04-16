const express = require('express');
const cors = require('cors');
const connectDB = require('./serverConnect');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const flightRoutes = require('./routes/flights');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users'); // Add this line

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Add this after your existing debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Update the static file serving to include the Website root directory
app.use(express.static(path.join(__dirname, '../..')));

// Add this after other static middleware
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes); // Add this line

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('CORS enabled for all origins');
});