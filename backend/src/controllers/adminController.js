const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const Cinema = require('../models/Cinema');

exports.getStats = async (req, res, next) => {
  try {
    const [totalMovies, totalBookings, totalUsers, totalShowtimes, totalCinemas, bookings] = await Promise.all([
      Movie.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Showtime.countDocuments(),
      Cinema.countDocuments(),
      Booking.find({ status: 'confirmed' }).lean(),
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const recentBookings = await Booking.find()
      .populate('movie')
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      totalMovies,
      totalBookings,
      totalUsers,
      totalShowtimes,
      totalCinemas,
      totalRevenue,
      recentBookings,
    });
  } catch (err) {
    next(err);
  }
};

exports.listCinemas = async (req, res, next) => {
  try {
    const cinemas = await Cinema.find().sort({ name: 1 }).lean();
    res.json({ cinemas });
  } catch (err) {
    next(err);
  }
};

exports.createCinema = async (req, res, next) => {
  try {
    const { name, address, city } = req.body;
    if (!name) return res.status(400).json({ error: 'Cinema name is required' });
    const cinema = new Cinema({ name, address, city });
    await cinema.save();
    res.status(201).json(cinema);
  } catch (err) {
    next(err);
  }
};

exports.deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ error: 'Cinema not found' });
    res.json({ message: 'Cinema deleted' });
  } catch (err) {
    next(err);
  }
};
