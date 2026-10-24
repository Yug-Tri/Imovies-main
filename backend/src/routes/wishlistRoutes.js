const express = require('express');
const auth = require('../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

const router = express.Router();

router.use(auth);

router.get('/', getWishlist);
router.post('/:movieId', addToWishlist);
router.delete('/:movieId', removeFromWishlist);

module.exports = router;
