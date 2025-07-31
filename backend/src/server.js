import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

dotenv.config();
await connectDB();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Backend listening on ${process.env.PORT}`)
);

export default app;  // for tests
