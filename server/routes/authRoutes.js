const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  firebaseRegister,
  firebaseLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/firebase-register', authLimiter, firebaseRegister);
router.post('/firebase-login', authLimiter, firebaseLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
