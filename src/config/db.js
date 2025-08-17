// src/config/db.js
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGO_URI environment variable. Set MONGO_URI in .env or your host provider.');
  }

  // optional settings
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  await mongoose.connect(uri, opts);
  console.log('MongoDB connected');
}
