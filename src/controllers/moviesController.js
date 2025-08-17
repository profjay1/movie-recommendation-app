// src/controllers/moviesController.js
import Movie from '../models/Movie.js';

export const getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).lean();
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const { title, description, year, rating } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const movie = await Movie.create({ title, description, year, rating });
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Movie not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const removed = await Movie.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).json({ error: 'Movie not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
