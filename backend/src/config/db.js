const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise || mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }).then((conn) => {
      logger.info('MongoDB connected successfully');
      return conn;
    }).catch((err) => {
      cachedPromise = null;
      logger.error('MongoDB connection error:', err);
      throw err;
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
