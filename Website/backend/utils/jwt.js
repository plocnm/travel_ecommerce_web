const jwt = require('jsonwebtoken');

/**
 * Tạo JWT token từ thông tin người dùng
 * @param {Object} payload - Dữ liệu chứa id, role, ...
 * @returns {String} token
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

/**
 * Xác thực và giải mã JWT
 * @param {String} token
 * @returns {Object} payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
