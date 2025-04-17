const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');

// Get all tours
router.get('/', async (req, res) => {
    try {
        const tours = await Tour.find()
            .select('name destination duration price status maxParticipants currentParticipants')
            .sort({ createdAt: -1 });
        res.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ message: 'Error fetching tours' });
    }
});

// Create new tour
router.post('/', async (req, res) => {
    try {
        const tour = new Tour(req.body);
        await tour.save();
        res.status(201).json(tour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;