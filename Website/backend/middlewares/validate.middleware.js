// middlewares/validate.middleware.js
const Joi = require('joi');

/**
 * Middleware kiểm tra đầu vào request theo schema Joi.
 * @param {Joi.ObjectSchema} schema Joi schema định nghĩa dữ liệu cần hợp lệ
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    next();
  };
};

module.exports = {
  validateBody
};
