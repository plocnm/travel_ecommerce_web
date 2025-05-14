// services/user.service.js
const User = require('../models/User');

const getAllUsers = async () => {
  return await User.find().select('-password'); // Ẩn mật khẩu
};

const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const updateUser = async (id, data) => {
  if (data.password) delete data.password; // Không cho update mật khẩu ở đây
  return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
