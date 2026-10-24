const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema' },
  theater: { type: String, required: true },
  format: { type: String, default: 'IMAX 4K' },
  price: { type: Number, default: 15.00 },
  startTime: { type: Date, required: true },
  seats: [{
    seatNumber: { type: String, required: true },
    row: { type: String },
    col: { type: Number },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, default: 15.00 }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
