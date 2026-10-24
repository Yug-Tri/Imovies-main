module.exports = (err, req, res, next) => {
  console.error(err.stack);
  // Do not leak details in production
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
};
