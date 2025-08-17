// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// PORT with fallback
const PORT = process.env.PORT || 3000;

// Start DB and server in a controlled way
async function start() {
  try {
    await connectDB();
    // Only start listening when not running tests (Jest, etc.)
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Backend listening on http://localhost:${PORT} (pid ${process.pid})`);
      });
    } else {
      console.log('Running in test mode — server not auto-started');
    }
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1); // non-zero exit on fatal startup error
  }
}

// call start()
start();

export default app; // for testing
