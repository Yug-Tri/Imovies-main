// backend/src/index.js
const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during development
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Root and health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'iMovies API',
    message: 'iMovies API is running successfully',
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    service: 'iMovies API',
    message: 'iMovies API is running successfully',
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'iMovies API' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'iMovies API' }));

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and listen only when executed directly
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`iMovies Backend listening on port ${PORT}`));
}

module.exports = app;
