// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Đảm bảo load .env ngay khi file được gọi

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || typeof uri !== 'string') {
      throw new Error('MONGODB_URI is missing or invalid in .env');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// 👉 Theo dõi lỗi kết nối
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// 👉 Thông báo khi mất kết nối
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// 👉 Đóng kết nối an toàn khi dừng ứng dụng
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
