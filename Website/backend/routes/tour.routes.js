// routes/tour.routes.js
const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);

// Protected routes (requires login)
router.post('/', authMiddleware.verifyToken, tourController.createTour);
router.put('/:id', authMiddleware.verifyToken, tourController.updateTour);
router.delete('/:id', authMiddleware.verifyToken, tourController.deleteTour);

module.exports = router;
