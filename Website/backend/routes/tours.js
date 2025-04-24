const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');

// Get all tours with optional filtering
router.get('/', async (req, res) => {
    try {
        const { search, status, minPrice, maxPrice } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) {
            filter.status = status;
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const tours = await Tour.find(filter)
            .select('name destination duration price status maxParticipants currentParticipants description')
            .sort({ createdAt: -1 });
            
        res.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ message: 'Error fetching tours' });
    }
});

// Get tour by ID
router.get('/:id', async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(tour);
    } catch (error) {
        res.status(500).json({ message: error.message });
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