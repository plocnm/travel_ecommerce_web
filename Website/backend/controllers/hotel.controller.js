// controllers/hotel.controller.js
const hotelService = require('../services/hotel.service');

const getAllHotels = async (req, res, next) => {
  try {
    const hotels = await hotelService.getAllHotels();
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

const getHotelById = async (req, res, next) => {
  try {
    const hotel = await hotelService.getHotelById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

const createHotel = async (req, res, next) => {
  try {
    const newHotel = await hotelService.createHotel(req.body);
    res.status(201).json({ message: 'Hotel created', hotel: newHotel });
  } catch (error) {
    next(error);
  }
};

const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await hotelService.updateHotel(req.params.id, req.body);
    if (!updatedHotel) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json({ message: 'Hotel updated', hotel: updatedHotel });
  } catch (error) {
    next(error);
  }
};

const deleteHotel = async (req, res, next) => {
  try {
    const deletedHotel = await hotelService.deleteHotel(req.params.id);
    if (!deletedHotel) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json({ message: 'Hotel deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
