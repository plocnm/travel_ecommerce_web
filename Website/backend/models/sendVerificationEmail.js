const nodemailer = require('nodemailer');


const sendVerificationEmail = async (toEmail, token) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const url = `http://localhost:${process.env.PORT}/api/verify/confirm?token=${token}`;

    await transporter.sendMail({
        from: `"Travel App" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Xác thực tài khoản Travel App',
        html: `<p>Mã xác thực của bạn là: <b>${token}</b></p>`
    });
};

module.exports = sendVerificationEmail;