// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

dotenv.config();
const app = express();


// CORS: restrict to your Vercel domain(s) in production
const allowedOrigins = [
  'https://movie-reco-frontend-sable.vercel.app',
  'https://movie-reco-frontend-git-main-technodevstacks-gmailcoms-projects.vercel.app',
  // add 'http://localhost:5173' for local dev if you want
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  }
}));

// Optional: explicitly handle preflight for all routes
app.options('*', cors());

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
//app.use(cors()); // allow all origins (or configure specific origin)

// PORT with fallback
const PORT = process.env.PORT || 3000;

/**
 * Setup global process & mongoose handlers for graceful shutdown and better logs.
 * Call setupProcessHandlers(server) after server is created.
 */
function setupProcessHandlers(server) {
  // Graceful shutdown helper
  const shutdown = async (signal) => {
    try {
      console.log(`\nReceived ${signal}. Graceful shutdown starting...`);

      // Stop accepting new connections
      if (server && server.close) {
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            console.log('HTTP server closed');
            resolve();
          });
        });
      }

      // Disconnect mongoose
      try {
        await mongoose.disconnect();
        console.log('Mongoose disconnected');
      } catch (e) {
        console.warn('Error disconnecting mongoose:', e);
      }

      console.log('Shutdown complete, exiting.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  // Listen for kill signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Uncaught exceptions and unhandled promise rejections
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION - shutting down:', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });

  // Mongoose connection events (helpful for debugging)
  mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
  mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));
  mongoose.connection.on('reconnected', () => console.log('Mongoose reconnected'));
}

// Start DB and server in a controlled way
async function start() {
  try {
    await connectDB();

    // Only start listening when not running tests (Jest, etc.)
    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`Backend listening on http://localhost:${PORT} (pid ${process.pid})`);
      });

      // attach global handlers so they have access to the server instance
      setupProcessHandlers(server);
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
