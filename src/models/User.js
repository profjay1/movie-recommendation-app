// src/models/User.js (Mongoose example)
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false } // select:false hides password by default
}, { timestamps: true });

export default mongoose.model('User', userSchema);
