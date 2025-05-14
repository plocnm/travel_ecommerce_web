const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
