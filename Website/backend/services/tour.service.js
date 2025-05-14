// services/tour.service.js
const Tour = require('../models/Tour');

const getAllTours = async () => {
  return await Tour.find();
};

const getTourById = async (id) => {
  return await Tour.findById(id);
};

const createTour = async (data) => {
  return await Tour.create(data);
};

const updateTour = async (id, data) => {
  return await Tour.findByIdAndUpdate(id, data, { new: true });
};

const deleteTour = async (id) => {
  return await Tour.findByIdAndDelete(id);
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
};
