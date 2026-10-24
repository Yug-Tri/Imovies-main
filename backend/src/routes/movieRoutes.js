const express = require('express');
const { listMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', listMovies);
router.get('/:id', getMovie);

// Admin routes
router.post('/', auth, requireRole('admin'), createMovie);
router.put('/:id', auth, requireRole('admin'), updateMovie);
router.delete('/:id', auth, requireRole('admin'), deleteMovie);

module.exports = router;
