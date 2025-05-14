// services/hotel.service.js
const Hotel = require('../models/Hotel');

const getAllHotels = async () => {
  return await Hotel.find();
};

const getHotelById = async (id) => {
  return await Hotel.findById(id);
};

const createHotel = async (data) => {
  return await Hotel.create(data);
};

const updateHotel = async (id, data) => {
  return await Hotel.findByIdAndUpdate(id, data, { new: true });
};

const deleteHotel = async (id) => {
  return await Hotel.findByIdAndDelete(id);
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
