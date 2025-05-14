const Flight = require('../models/Flight');

const getAllFlights = async () => {
  return await Flight.find();
};

const getFlightById = async (id) => {
  return await Flight.findById(id);
};

const createFlight = async (data) => {
  return await Flight.create(data);
};

const updateFlight = async (id, data) => {
  return await Flight.findByIdAndUpdate(id, data, { new: true });
};

const deleteFlight = async (id) => {
  return await Flight.findByIdAndDelete(id);
};

module.exports = {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
};
