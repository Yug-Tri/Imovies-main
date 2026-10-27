const app = require('../backend/src/index');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
