import express from 'express';
import axios from 'axios';
import cors from 'cors';
import QRCode from 'qrcode';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import Search from './models/Search.js'; // MongoDB schema

const app = express();
const PORT = 5000;

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect('mongodb+srv://Afzal:Afzal2004@cluster0.nfd8knt.mongodb.net/songQR?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
  // TTL index creation (optional but safe to include once)
  Search.collection.createIndex({ lastVisited: 1 }, { expireAfterSeconds: 604800 });
}).catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ➕ Save Search and Generate QR
app.post('/generate-qr', async (req, res) => {
  const { songName } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  if (!songName) return res.status(400).json({ error: 'songName is required' });

  try {
    // Save or update search data for this IP
    await Search.findOneAndUpdate(
      { ip },
      {
        $push: {
          searches: {
            query: songName,
            timestamp: new Date()
          }
        },
        $set: { lastVisited: new Date() }
      },
      { upsert: true, new: true }
    );

    // YouTube search using RapidAPI
    const options = {
      method: 'GET',
      url: 'https://youtube138.p.rapidapi.com/search/',
      params: { q: songName, hl: 'en', gl: 'US' },
      headers: {
        'X-RapidAPI-Key': 'd4483c00ffmshbc7e562e7198fecp16e49fjsn386726ccd15c',
        'X-RapidAPI-Host': 'youtube138.p.rapidapi.com',
      },
    };

    const response = await axios.request(options);
    const contents = response.data.contents;
    const firstVideo = contents.find((item) => item.video);

    if (!firstVideo) return res.status(404).json({ error: 'No video found' });

    const videoId = firstVideo.video.videoId;
    const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;
   // const redirectLink = `https://song-qr.vercel.app/play.html?song=${encodeURIComponent(youtubeLink)}`;
    const redirectLink = `http://localhost:5000/play.html?song=${encodeURIComponent(youtubeLink)}`;
    const qrCodeDataURL = await QRCode.toDataURL(redirectLink);

    return res.json({
      youtubeLink,
      redirectLink,
      qrCode: qrCodeDataURL,
    });

  } catch (err) {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.data);
      return res.status(err.response.status).json({ error: err.response.data });
    } else {
      console.error('Unexpected error:', err.message);
      return res.status(500).json({ error: 'Unexpected server error' });
    }
  }
});

// 🔍 Suggestions API
app.get('/suggestions', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const q = req.query.q;

  if (!q || q.length < 1) return res.json([]);

  const userSearch = await Search.findOne({ ip });

  if (!userSearch) return res.json([]);

  const filtered = userSearch.searches
    .filter(s => s.query.toLowerCase().startsWith(q.toLowerCase()))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(s => s.query);

  res.json(filtered);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});




   