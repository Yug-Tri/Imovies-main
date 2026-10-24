const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Screen', screenSchema);
