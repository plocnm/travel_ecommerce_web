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
            .select('name destination duration price status maxParticipants currentParticipants description images')
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
        const newTourData = req.body;
        // Convert comma-separated strings to arrays for relevant fields
        if (newTourData.included && typeof newTourData.included === 'string') {
            newTourData.included = newTourData.included.split(',').map(item => item.trim());
        }
        if (newTourData.excluded && typeof newTourData.excluded === 'string') {
            newTourData.excluded = newTourData.excluded.split(',').map(item => item.trim());
        }
        if (newTourData.images && typeof newTourData.images === 'string') {
            newTourData.images = newTourData.images.split(',').map(item => item.trim());
        }
        // Parse JSON strings for itinerary and departureDates
        if (newTourData.itinerary && typeof newTourData.itinerary === 'string') {
            try {
                newTourData.itinerary = JSON.parse(newTourData.itinerary);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid Itinerary JSON format' });
            }
        }
        if (newTourData.departureDates && typeof newTourData.departureDates === 'string') {
            try {
                newTourData.departureDates = JSON.parse(newTourData.departureDates);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid Departure Dates JSON format' });
            }
        }

        const tour = new Tour(newTourData);
        await tour.save();
        res.status(201).json(tour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update tour by ID
router.put('/:id', async (req, res) => {
    try {
        const tourId = req.params.id;
        const updatedTourData = req.body;

        // Convert comma-separated strings to arrays for relevant fields
        if (updatedTourData.included && typeof updatedTourData.included === 'string') {
            updatedTourData.included = updatedTourData.included.split(',').map(item => item.trim());
        }
        if (updatedTourData.excluded && typeof updatedTourData.excluded === 'string') {
            updatedTourData.excluded = updatedTourData.excluded.split(',').map(item => item.trim());
        }
        if (updatedTourData.images && typeof updatedTourData.images === 'string') {
            updatedTourData.images = updatedTourData.images.split(',').map(item => item.trim());
        }
        // Parse JSON strings for itinerary and departureDates
        if (updatedTourData.itinerary && typeof updatedTourData.itinerary === 'string') {
            try {
                updatedTourData.itinerary = JSON.parse(updatedTourData.itinerary);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid Itinerary JSON format' });
            }
        }
        if (updatedTourData.departureDates && typeof updatedTourData.departureDates === 'string') {
            try {
                updatedTourData.departureDates = JSON.parse(updatedTourData.departureDates);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid Departure Dates JSON format' });
            }
        }

        const updatedTour = await Tour.findByIdAndUpdate(tourId, updatedTourData, { new: true, runValidators: true });

        if (!updatedTour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        res.json(updatedTour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete tour by ID
router.delete('/:id', async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json({ message: 'Tour deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;