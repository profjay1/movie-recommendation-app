/*// auth.js
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { body } from 'express-validator';
const r = Router();
r.post('/register', body('email').isEmail(), register);
r.post('/login', login);
export default r;*/

// src/routes/auth.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = Router();

/**
 * Middleware to run validations and return a 400 with errors if any.
 */
const runValidations = async (req, res, next) => {
  const results = validationResult(req);
  if (results.isEmpty()) return next();
  return res.status(400).json({ errors: results.array() });
};

// Validation rules for registration
const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Validation rules for login
const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidators, runValidations, register);
router.post('/login', loginValidators, runValidations, login);

export default router;
