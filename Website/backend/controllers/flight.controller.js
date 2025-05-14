const flightService = require('../services/flight.service');

const getAllFlights = async (req, res, next) => {
  try {
    const flights = await flightService.getAllFlights();
    res.status(200).json(flights);
  } catch (error) {
    next(error);
  }
};

const getFlightById = async (req, res, next) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json(flight);
  } catch (error) {
    next(error);
  }
};

const createFlight = async (req, res, next) => {
  try {
    const newFlight = await flightService.createFlight(req.body);
    res.status(201).json({ message: 'Flight created', flight: newFlight });
  } catch (error) {
    next(error);
  }
};

const updateFlight = async (req, res, next) => {
  try {
    const updated = await flightService.updateFlight(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json({ message: 'Flight updated', flight: updated });
  } catch (error) {
    next(error);
  }
};

const deleteFlight = async (req, res, next) => {
  try {
    const deleted = await flightService.deleteFlight(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json({ message: 'Flight deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
};