const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../models/sendVerificationEmail'); // Đường dẫn đúng đến file gửi email

// Đăng nhập
router.post('/login', async (req, res) => {
try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Tài khoản chưa được xác thực qua email.' });
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.' });
    }
});


// Đăng ký (kèm xác thực email)
router.post('/register', async (req, res) => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Tạo mã xác thực
     const code = generateCode();
    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        const verificationCode = code;
        const user = new User({ name, email, phone, password,verificationCode,isVerified: false });
        await user.save();

        // Tạo token xác thực email
        // const emailToken = jwt.sign(
        //     { code },
        //  //   process.env.JWT_SECRET,
        // );
        user.verificationCode = code;

        // Gửi email xác thực
        await sendVerificationEmail(user.email, code);

        res.status(201).json({
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.' });
    }
});

router.post('/verify', async (req, res) => {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (user.verificationCode !== code) {
        return res.status(400).json({ message: 'Mã xác minh không đúng.' });
    }

    user.isVerified = true;
    user.verificationCode = null; // Xoá mã sau khi xác minh
    await user.save();

    res.json({ message: 'Xác minh thành công. Bạn có thể đăng nhập.' });
});

const nodemailer = require('nodemailer'); // nếu chưa có
const crypto = require('crypto');

// Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordCode = resetCode;
        user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 phút
        await user.save();

        // Gửi email chứa mã
        await sendVerificationEmail(user.email, resetCode); // dùng lại hàm gửi mã

        res.json({ message: 'Đã gửi mã đặt lại mật khẩu đến email của bạn.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Mã không đúng hoặc đã hết hạn.' });
        }

        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetCodeExpiry = null;
        await user.save();

        res.json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
});

module.exports = router;
