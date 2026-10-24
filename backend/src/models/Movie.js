const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  genre: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  posterUrl: { type: String, default: '' },
  backdropUrl: { type: String, default: '' },
  duration: { type: Number, default: 120 }, // in minutes
  releaseDate: { type: String, default: '' },
  director: { type: String, default: '' },
  cast: { type: [String], default: [] },
  trailerUrl: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  externalId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
