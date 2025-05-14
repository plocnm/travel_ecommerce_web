// routes/hotel.routes.js
const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);

// Protected routes (admin or authenticated user)
router.post('/', authMiddleware.verifyToken, hotelController.createHotel);
router.put('/:id', authMiddleware.verifyToken, hotelController.updateHotel);
router.delete('/:id', authMiddleware.verifyToken, hotelController.deleteHotel);

module.exports = router;
