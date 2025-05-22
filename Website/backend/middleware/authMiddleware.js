const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User'); // Assuming User model is needed for role check

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token not provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Optionally, fetch the user from DB to confirm role if not stored in token or if it can change
        // const user = await User.findById(decoded.userId);
        // if (!user || user.role !== 'admin') {
        if (decoded.role !== 'admin') { // Assuming role is in JWT payload
            return res.status(403).json({ message: 'Admin access required' });
        }
        req.user = decoded; // Add decoded token (which includes role and userId) to request
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('verifyAdmin error:', error);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

// General authentication middleware (if you have one, or plan to add one)
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token not provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user id and role to request object
        next();
    } catch (error) {
         if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('authMiddleware error:', error);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

module.exports = { verifyAdmin, authMiddleware }; 