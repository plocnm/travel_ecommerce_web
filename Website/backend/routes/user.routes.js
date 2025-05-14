// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Các route yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// Lấy danh sách tất cả người dùng (chỉ dành cho admin nếu có kiểm tra thêm)
router.get('/', userController.getAllUsers);

// Lấy thông tin người dùng theo ID
router.get('/:id', userController.getUserById);

// Cập nhật thông tin người dùng
router.put('/:id', userController.updateUser);

// Xoá người dùng
router.delete('/:id', userController.deleteUser);

module.exports = router;
