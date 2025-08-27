// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../src/models/Movie.js'; // adjust path/name if different

dotenv.config();

const sampleMovies = [
  {
    title: 'The Discovery',
    year: 2020,
    genre: 'Sci-Fi',
    overview: 'A computer hacker learns about the true nature of reality.'
  },
  {
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    overview: 'A thief who enters people\'s dreams takes on one last job.'
  },
  {
    title: 'The Shawshank Redemption',
    year: 1994,
    genre: 'Drama',
    overview: 'Two imprisoned men bond over a number of years...'
  }
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI not set in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      // Use sensible defaults; Mongoose will handle if options are not needed
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected. Seeding database...');

    // Be careful: deleteMany will remove existing documents
    // Remove this line if you prefer to keep existing data
    await Movie.deleteMany({});
    const inserted = await Movie.insertMany(sampleMovies);

    console.log(`Inserted ${inserted.length} movies.`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected. Seed finished.');
    process.exit(0);
  }
}

seed();
