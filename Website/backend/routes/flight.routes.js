// routes/flight.routes.js
const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Các route không cần đăng nhập
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);

// Các route yêu cầu xác thực và vai trò admin (có thể bổ sung thêm middleware riêng nếu cần)
router.post('/', authMiddleware.verifyToken, flightController.createFlight);
router.put('/:id', authMiddleware.verifyToken, flightController.updateFlight);
router.delete('/:id', authMiddleware.verifyToken, flightController.deleteFlight);

module.exports = router;