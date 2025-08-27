// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

// DEBUG STARTUP MARKER (temporary)
console.log('DEPLOY_MARKER_START: edaecea'); // <-- unique string to find in Railway logs
console.log('NODE_ENV =', process.env.NODE_ENV, 'PORT =', process.env.PORT);

// quick debug CORS override + request logger (temporary, safe)
import cors from 'cors';
app.use(cors());               // permissive for debug only
app.options('*', cors());
app.use((req, res, next) => {
  console.log('DBG_REQ:', req.method, req.originalUrl, 'Origin:', req.headers.origin);
  // also set explicit headers (helpful if something strips them)
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});



dotenv.config();

const app = express();

// ---------- CORS setup (whitelist) ----------
// You can provide a comma-separated list in ALLOWED_ORIGINS env var.
// Example: ALLOWED_ORIGINS="https://my-frontend.vercel.app,http://localhost:5173"
const defaultOrigins = [
  'https://movie-reco-frontend-sable.vercel.app',
  'https://movie-reco-frontend-git-main-technodevstacks-gmailcoms-projects.vercel.app',
  'http://localhost:5173', // local dev (Vite default)
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;

/*app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
})); */

app.use(cors());

console.log('>>> CORS middleware configured with allowedOrigins:', JSON.stringify(allowedOrigins));

// ensure preflight requests are handled
app.options('*', cors());

// ---------- Middleware & routes ----------
app.use(express.json());

app.use((req, res, next) => {
  console.log('incoming request:', req.method, req.originalUrl, 'Origin:', req.headers.origin);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler (keeps returned JSON consistent)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err));
  // If CORS middleware rejected the origin, return 403 with message
  if (err && err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
});

// ---------- Graceful shutdown helpers ----------
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

// ---------- Start server (connect DB first) ----------
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB(); // assumes ./config/db.js exports connectDB()
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
