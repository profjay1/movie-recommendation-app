// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

dotenv.config();

const app = express();

// ---------- DEBUG STARTUP MARKER (temporary) ----------
console.log('DEPLOY_MARKER_START: edaecea'); // unique string to find in Railway logs
console.log('NODE_ENV =', process.env.NODE_ENV, 'PORT =', process.env.PORT);

// ---------- DEBUG / TEMP permissive CORS (for testing only) ----------
/**
 * TEMPORARY: allow all origins and set explicit headers for debugging.
 * Replace this with secure whitelist CORS before final submission.
 */
app.use(cors());            // permissive: allows any origin
app.options('*', cors());

// Request logger + explicit debug headers (helpful if something strips headers)
app.use((req, res, next) => {
  console.log('DBG_REQ:', req.method, req.originalUrl, 'Origin:', req.headers.origin);
  // Explicitly set CORS headers for debugging (will be visible in responses)
  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// -------------------------------------------------------

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err));
  res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
});

// Graceful shutdown helpers
function setupProcessHandlers(server) {
  const shutdown = async (signal) => {
    try {
      console.log(`\nReceived ${signal}. Graceful shutdown starting...`);
      if (server && server.close) {
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            console.log('HTTP server closed');
            resolve();
          });
        });
      }
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

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION - shutting down:', err);
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });

  mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
  mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));
  mongoose.connection.on('reconnected', () => console.log('Mongoose reconnected'));
}

// Start server in a controlled way
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`Backend listening on http://localhost:${PORT} (pid ${process.pid})`);
      });
      setupProcessHandlers(server);
    } else {
      console.log('Running in test mode — server not auto-started');
    }
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
}

start();

export default app;
