const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const sendVerificationEmail = require('../models/sendVerificationEmail'); // sửa lại đường dẫn chính xác

const router = express.Router();

// Bộ nhớ tạm thời (nên thay bằng Redis/Mongo nếu production)
const tempVerifications = new Map();

// 1. Gửi email xác thực
router.post('/send', async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Tạo token xác thực
        const token = crypto.randomBytes(32).toString('hex');

        // Lưu tạm thông tin đăng ký
        tempVerifications.set(token, {
            name,
            email,
            phone,
            password,
            createdAt: Date.now()
        });

        // Gửi email xác thực
        const confirmUrl = `${process.env.CLIENT_URL}/verify-email.html?token=${token}`;
        await sendVerificationEmail(email, confirmUrl);

        return res.status(200).json({ message: 'Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư.' });
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email xác thực.' });
    }
});

// 2. Xác nhận token và tạo tài khoản
router.get('/confirm', async (req, res) => {
    const { token } = req.query;

    const data = tempVerifications.get(token);
    if (!data) {
        return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    try {
        const newUser = new User({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password
        });

        await newUser.save();
        tempVerifications.delete(token);

        return res.status(201).json({ message: 'Tài khoản đã được tạo thành công!' });
    } catch (error) {
        console.error('Lỗi tạo tài khoản:', error);
        return res.status(500).json({ message: 'Không thể tạo tài khoản. Vui lòng thử lại.' });
    }
});

module.exports = router;
