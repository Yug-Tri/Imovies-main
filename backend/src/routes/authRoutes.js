const express = require('express');
const { register, login, logout, profile } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(rateLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profile);

module.exports = router;
