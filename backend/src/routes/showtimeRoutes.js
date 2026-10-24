const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getShowtime,
  getShowtimesByMovie,
  createShowtime,
  deleteShowtime,
} = require('../controllers/showtimeController');

const router = express.Router();

router.get('/:id', getShowtime);
router.get('/movie/:movieId', getShowtimesByMovie);

// Admin routes
router.post('/', auth, requireRole('admin'), createShowtime);
router.delete('/:id', auth, requireRole('admin'), deleteShowtime);

module.exports = router;
