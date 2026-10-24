const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'imovies_jwt_secret_dev_key_2026';
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, email: payload.email, role: payload.role || 'user' };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
