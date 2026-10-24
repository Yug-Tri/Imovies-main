module.exports = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    // For now, user role is stored in JWT payload if present; fallback to 'user'
    if (req.user.role && req.user.role === role) {
      return next();
    }
    // If role not present, reject
    return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
  };
};
