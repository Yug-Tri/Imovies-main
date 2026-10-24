const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

function setTokenCookie(res, user) {
  const secret = process.env.JWT_SECRET || 'imovies_jwt_secret_dev_key_2026';
  const payload = { id: user._id, email: user.email, role: user.role || 'user' };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/' });
}

exports.register = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const user = new User({ email });
      await user.setPassword(password);
      await user.save();
      setTokenCookie(res, user);
      return res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role || 'user' });
    } catch (err) { next(err); }
  }
];

exports.login = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await user.validatePassword(password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      setTokenCookie(res, user);
      return res.json({ id: user._id, email: user.email, name: user.name, role: user.role || 'user' });
    } catch (err) { next(err); }
  }
];

exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' });
  return res.json({ message: 'Logged out' });
};

exports.profile = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user._id, email: user.email, name: user.name, role: user.role || 'user' });
  } catch (err) {
    next(err);
  }
};
