const app = require('../src/index');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
