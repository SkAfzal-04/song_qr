import express from 'express';
import axios from 'axios';
import cors from 'cors';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// RapidAPI credentials
const RAPID_API_KEY = 'd4483c00ffmshbc7e562e7198fecp16e49fjsn386726ccd15c';
const RAPID_API_HOST = 'youtube138.p.rapidapi.com';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Generate QR Code API
app.post('/generate-qr', async (req, res) => {
  const { songName } = req.body;
  if (!songName) return res.status(400).json({ error: 'songName is required' });

  try {
    const options = {
      method: 'GET',
      url: 'https://youtube138.p.rapidapi.com/search/',
      params: { q: songName, hl: 'en', gl: 'US' },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    };

    const response = await axios.request(options);
    const contents = response.data.contents;
    const firstVideo = contents.find((item) => item.video);

    if (!firstVideo) return res.status(404).json({ error: 'No video found' });

    const videoId = firstVideo.video.videoId;
    const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

    const redirectLink = `http://localhost:5000/play.html?song=${encodeURIComponent(youtubeLink)}`;
    const qrCodeDataURL = await QRCode.toDataURL(redirectLink);
    console.log(redirectLink)

    return res.json({
      youtubeLink,
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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
