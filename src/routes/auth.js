// auth.js
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { body } from 'express-validator';
const r = Router();
r.post('/register', body('email').isEmail(), register);
r.post('/login', login);
export default r;