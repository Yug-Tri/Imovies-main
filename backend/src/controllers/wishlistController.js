const User = require('../models/User');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/:movieId
exports.addToWishlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.wishlist.includes(movieId)) {
      user.wishlist.push(movieId);
      await user.save();
    }
    const updated = await User.findById(req.user.id).populate('wishlist').lean();
    res.json({ wishlist: updated.wishlist });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:movieId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.wishlist = user.wishlist.filter(id => id.toString() !== movieId);
    await user.save();
    const updated = await User.findById(req.user.id).populate('wishlist').lean();
    res.json({ wishlist: updated.wishlist });
  } catch (err) {
    next(err);
  }
};
