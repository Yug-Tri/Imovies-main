const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// GET /api/movies
exports.listMovies = async (req, res, next) => {
  try {
    const { search, genre, featured, sort, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }
    if (genre && genre !== 'All') {
      filter.genre = genre;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    let query = Movie.find(filter);
    if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else if (sort === 'latest') {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ isFeatured: -1, rating: -1 });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Movie.countDocuments(filter);
    const movies = await query.skip((pageNum - 1) * limitNum).limit(limitNum).lean();

    res.json({ movies, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id
exports.getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const showtimes = await Showtime.find({ movie: movie._id }).sort({ startTime: 1 }).lean();
    res.json({ movie, showtimes });
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/movies
exports.createMovie = async (req, res, next) => {
  try {
    const { title, description, genre, rating, posterUrl, backdropUrl, duration, releaseDate, director, cast, trailerUrl, isFeatured } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Movie title is required' });
    }
    const movie = new Movie({
      title,
      description,
      genre: Array.isArray(genre) ? genre : (genre ? genre.split(',').map(s => s.trim()) : []),
      rating: Number(rating) || 0,
      posterUrl,
      backdropUrl,
      duration: Number(duration) || 120,
      releaseDate,
      director,
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(s => s.trim()) : []),
      trailerUrl,
      isFeatured: Boolean(isFeatured)
    });
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/movies/:id
exports.updateMovie = async (req, res, next) => {
  try {
    const { title, description, genre, rating, posterUrl, backdropUrl, duration, releaseDate, director, cast, trailerUrl, isFeatured } = req.body;
    const updateData = {
      title,
      description,
      rating: Number(rating),
      posterUrl,
      backdropUrl,
      duration: Number(duration),
      releaseDate,
      director,
      trailerUrl,
      isFeatured: Boolean(isFeatured)
    };
    if (genre !== undefined) {
      updateData.genre = Array.isArray(genre) ? genre : genre.split(',').map(s => s.trim());
    }
    if (cast !== undefined) {
      updateData.cast = Array.isArray(cast) ? cast : cast.split(',').map(s => s.trim());
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/movies/:id
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    await Showtime.deleteMany({ movie: movie._id });
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    next(err);
  }
};
