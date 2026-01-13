// server.js - Simple API + Socket.IO + file persistence (demo only)
// Rebrandeado a "Funbox"
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');

const DATA_FILE = path.join(__dirname, 'data.json');
const JWT_SECRET = 'dev_secret_for_demo_change_me';
const PORT = process.env.PORT || 3000;

function readData(){
  if(!fs.existsSync(DATA_FILE)){
    const initial = { users: [], games: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function writeData(data){ fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory active players map (not persisted)
const activePlayers = {}; // { [gameId]: Set(socketId) }

// --- Socket.IO logic ---
io.on('connection', socket=>{
  socket.on('joinGame', ({ gameId })=>{
    activePlayers[gameId] = activePlayers[gameId] || new Set();
    activePlayers[gameId].add(socket.id);
    const count = activePlayers[gameId].size;
    io.emit('players:update', { gameId, count });
  });
  socket.on('leaveGame', ({ gameId })=>{
    if(activePlayers[gameId]) activePlayers[gameId].delete(socket.id);
    const count = activePlayers[gameId] ? activePlayers[gameId].size : 0;
    io.emit('players:update', { gameId, count });
  });
  socket.on('disconnect', ()=>{
    // remove from all sets
    for(const [gameId, set] of Object.entries(activePlayers)){
      if(set.has(socket.id)){
        set.delete(socket.id);
        io.emit('players:update', { gameId, count: set.size });
      }
    }
  });
});

// --- Auth helpers ---
function generateToken(user){ return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' }); }
function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No auth header' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Bad auth header' });
  const token = parts[1];
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Routes ---

// Register
app.post('/api/register', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });
  const data = readData();
  if(data.users.find(u=>u.username === username)) return res.status(400).json({ error: 'username already taken' });
  const hashed = bcrypt.hashSync(password, 8);
  const user = { id: Date.now(), username, password: hashed, avatar: `https://api.dicebear.com/6.x/identicon/svg?seed=${encodeURIComponent(username)}` };
  data.users.push(user);
  writeData(data);
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar } });
});

// Login
app.post('/api/login', (req,res)=>{
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find(u=>u.username === username);
  if(!user) return res.status(400).json({ error: 'invalid credentials' });
  if(!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar } });
});

// Me
app.get('/api/me', authMiddleware, (req,res)=>{
  const data = readData();
  const user = data.users.find(u=>u.id === req.user.id);
  if(!user) return res.status(404).json({ error: 'user not found' });
  res.json({ id: user.id, username: user.username, avatar: user.avatar });
});

// List games
app.get('/api/games', (req,res)=>{
  const data = readData();
  // Add active players counts from in-memory
  const games = data.games.map(g => {
    const liveCount = activePlayers[g.id] ? activePlayers[g.id].size : 0;
    return { ...g, players: Math.max(g.players, liveCount) };
  });
  res.json(games);
});

// Create game (auth required)
app.post('/api/games', authMiddleware, (req,res)=>{
  const { title, desc, thumb } = req.body;
  if(!title) return res.status(400).json({ error: 'title required' });
  const data = readData();
  const game = { id: Date.now().toString(), title, desc: desc || '', thumb: thumb || `https://via.placeholder.com/420x220.png?text=${encodeURIComponent(title)}`, players: 0, ownerId: req.user.id };
  data.games.push(game);
  writeData(data);
  res.json(game);
});

// "Play" endpoint: increments stored players (for history) and emits update
app.post('/api/games/:id/play', (req,res)=>{
  const gameId = req.params.id;
  const data = readData();
  const game = data.games.find(g=>String(g.id) === String(gameId));
  if(!game) return res.status(404).json({ error: 'game not found' });
  // increment stored total players (not active players)
  game.players = (game.players || 0) + 1;
  writeData(data);
  // broadcast approximate update (live counts come from sockets)
  io.emit('players:increment', { gameId: game.id, players: game.players });
  res.json({ ok: true, game });
});

// Fallback to index
app.get('*', (req,res)=>{ res.sendFile(path.join(__dirname, 'public', 'index.html')); });

server.listen(PORT, ()=> console.log(`Funbox server running on http://localhost:${PORT}`));
