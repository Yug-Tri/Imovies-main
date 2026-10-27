const app = require('../backend/src/index');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed in serverless function:', err);
    return res.status(500).json({
      error: 'Database connection failed',
      message: err.message,
    });
  }
  return app(req, res);
};
