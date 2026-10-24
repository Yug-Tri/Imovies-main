const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

// Helper to generate seat grid for a showtime
function generateSeats(rows = 6, cols = 8, price = 15.00) {
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats = [];
  for (let r = 0; r < Math.min(rows, rowLetters.length); r++) {
    const row = rowLetters[r];
    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatNumber: `${row}${c}`,
        row,
        col: c,
        isBooked: false,
        price,
      });
    }
  }
  return seats;
}

// GET /api/showtimes/:id
exports.getShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('cinema')
      .lean();

    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    res.json({ showtime });
  } catch (err) {
    next(err);
  }
};

// GET /api/showtimes/movie/:movieId
exports.getShowtimesByMovie = async (req, res, next) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId })
      .populate('cinema')
      .sort({ startTime: 1 })
      .lean();

    res.json({ showtimes });
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/showtimes
exports.createShowtime = async (req, res, next) => {
  try {
    const { movieId, theater, format, price, startTime, rows = 6, cols = 8 } = req.body;
    if (!movieId || !theater || !startTime) {
      return res.status(400).json({ error: 'Movie, theater, and startTime are required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const seats = generateSeats(Number(rows) || 6, Number(cols) || 8, Number(price) || 15.00);

    const showtime = new Showtime({
      movie: movieId,
      theater,
      format: format || 'IMAX 4K',
      price: Number(price) || 15.00,
      startTime: new Date(startTime),
      seats,
    });

    await showtime.save();
    const populated = await Showtime.findById(showtime._id).populate('movie').lean();
    res.status(201).json({ showtime: populated });
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/showtimes/:id
exports.deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    res.json({ message: 'Showtime deleted' });
  } catch (err) {
    next(err);
  }
};
