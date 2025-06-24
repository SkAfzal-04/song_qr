import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  ip: { type: String, unique: true },
  searches: [
    {
      query: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastVisited: { type: Date, default: Date.now, expires: '7d' }
});

export default mongoose.model('Search', searchSchema);
