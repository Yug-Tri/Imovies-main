const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getStats,
  listCinemas,
  createCinema,
  deleteCinema,
} = require('../controllers/adminController');

const router = express.Router();

router.use(auth);
router.use(requireRole('admin'));

router.get('/stats', getStats);
router.get('/cinemas', listCinemas);
router.post('/cinemas', createCinema);
router.delete('/cinemas/:id', deleteCinema);

module.exports = router;
