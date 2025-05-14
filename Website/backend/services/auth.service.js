const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
};

const register = async (data) => {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role || 'user'
    });

    const token = generateToken(newUser);
    return { user: newUser, token };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken(user);
    return { user, token };
};

module.exports = { register, login };
