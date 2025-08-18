// src/config/db.js
import mongoose from 'mongoose';

const MAX_RETRIES = parseInt(process.env.DB_CONNECT_RETRIES || '5', 10);
const RETRY_DELAY_MS = parseInt(process.env.DB_RETRY_DELAY_MS || '3000', 10);

async function attemptConnect(uri, opts, attempt = 1) {
  try {
    await mongoose.connect(uri, opts);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`MongoDB connection failed (attempt ${attempt}):`, err.message || err);
    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      return attemptConnect(uri, opts, attempt + 1);
    }
    console.error('Max MongoDB connection attempts reached — throwing');
    throw err;
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI env var');
  // Mongoose v6+ doesn't need deprecated options
  const opts = {};
  await attemptConnect(uri, opts);
}
