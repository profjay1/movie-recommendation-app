import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  email:  { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: Number }] // TMDB movie IDs
});
export default mongoose.model('User', UserSchema);
