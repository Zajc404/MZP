const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/mp3app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  refreshToken: String,
});

const User = mongoose.model('User', UserSchema);

const accessSecret = 'ACCESS_SECRET';
const refreshSecret = 'REFRESH_SECRET';

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.user.username}.mp3`),
});
const upload = multer({ storage });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, accessSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// === REJESTRACJA & LOGOWANIE ===
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: 'User exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash });
  await user.save();
  res.sendStatus(201);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ username }, accessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username }, refreshSecret);
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
});

app.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken: token });
  if (!user) return res.sendStatus(403);

  jwt.verify(token, refreshSecret, (err, decoded) => {
    if (err || user.username !== decoded.username) return res.sendStatus(403);
    const accessToken = jwt.sign({ username: user.username }, accessSecret, { expiresIn: '15m' });
    res.json({ accessToken });
  });
});

app.post('/logout', async (req, res) => {
  const { token } = req.body;
  await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  res.sendStatus(204);
});

// === UPLOAD MP3 ===
app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  res.sendStatus(200);
});

app.get('/audio', authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, 'uploads', `${req.user.username}.mp3`);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(filePath);
});

// === OBSŁUGA ESP32 ===
app.post('/esp', (req, res) => {
  console.log('ESP32 req body:', req.body);
  const { username } = req.body;

   if (!username) {
     return res.status(404).json({ error: 'Użytkownik nieznany' });
   }else{
      console.log(`ESP32 request for user: ${username}`);
   }

  const filePath = path.join(__dirname, 'uploads', `${username}.mp3`);
   if (!fs.existsSync(filePath)) {
     return res.status(404).json({ error: 'Plik nie istnieje' });
   }else{
      console.log(`File exists for user: ${username}`);
    }

  // Zwracamy URL do streamu dla ESP
  const streamUrl = `http://ip-v4:5000/stream/${username}.mp3`;
  res.json({ url: streamUrl });
});

app.get('/stream/:username', (req, res) => {
  const { username } = req.params;
  console.log(`Stream request for user: ${username}`);
  const filePath = path.join(__dirname, 'uploads', `${username}.mp3`);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes'
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
