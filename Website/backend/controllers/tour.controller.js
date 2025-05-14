// controllers/tour.controller.js
const tourService = require('../services/tour.service');

const getAllTours = async (req, res, next) => {
  try {
    const tours = await tourService.getAllTours();
    res.status(200).json(tours);
  } catch (error) {
    next(error);
  }
};

const getTourById = async (req, res, next) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.status(200).json(tour);
  } catch (error) {
    next(error);
  }
};

const createTour = async (req, res, next) => {
  try {
    const newTour = await tourService.createTour(req.body);
    res.status(201).json({ message: 'Tour created', tour: newTour });
  } catch (error) {
    next(error);
  }
};

const updateTour = async (req, res, next) => {
  try {
    const updatedTour = await tourService.updateTour(req.params.id, req.body);
    if (!updatedTour) return res.status(404).json({ message: 'Tour not found' });
    res.status(200).json({ message: 'Tour updated', tour: updatedTour });
  } catch (error) {
    next(error);
  }
};

const deleteTour = async (req, res, next) => {
  try {
    const deletedTour = await tourService.deleteTour(req.params.id);
    if (!deletedTour) return res.status(404).json({ message: 'Tour not found' });
    res.status(200).json({ message: 'Tour deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
};
