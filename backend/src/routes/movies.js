// movies.js
import { Router } from 'express';
import auth from '../middleware/auth.js';
import { searchMovies } from '../controllers/movieController.js';
const r = Router();
r.get('/search', auth, searchMovies);
export default r;