// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // ensure email has unique index in model

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // change as needed

// Helper to create a JWT
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Register new user
 * - Checks for duplicates
 * - Hashes password
 * - Returns JWT token (and optionally user info)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Defensive checks (route validator should already enforce)
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prevent duplicate email
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ name, email, password: hashed });

    const token = createToken({ id: user._id });

    // Option A: return token in JSON
    return res.status(201).json({ token });

    // Option B: (alternate) set HttpOnly cookie (uncomment if you want)
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    // });
    // return res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('register error:', err);
    return next ? next(err) : res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login existing user
 * - Verifies credentials
 * - Returns JWT token
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await User.findOne({ email }).select('+password'); // ensure password is returned if schema hides it
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken({ id: user._id });

    return res.json({ token });
    // Or set cookie as option (see register above)
  } catch (err) {
    console.error('login error:', err);
    return next ? next(err) : res.status(500).json({ error: 'Internal server error' });
  }
};
