// src/models/Movie.js
import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  year: { type: Number },
  rating: { type: Number, min: 0, max: 10 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', movieSchema);
