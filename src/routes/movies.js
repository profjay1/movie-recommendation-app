// src/routes/movies.js
import { Router } from 'express';
import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/moviesController.js';

const router = Router();

router.get('/', getAllMovies);            // GET /api/movies
router.post('/', createMovie);           // POST /api/movies
router.get('/:id', getMovieById);        // GET /api/movies/:id
router.put('/:id', updateMovie);         // PUT /api/movies/:id
router.delete('/:id', deleteMovie);      // DELETE /api/movies/:id

export default router;
