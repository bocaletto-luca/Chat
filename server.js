const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware per il parsing del JSON
app.use(express.json());
// Middleware per le sessioni (in memoria, per demo)
app.use(session({
  secret: 'your-very-secret-key', // Sostituisci con una stringa segreta robusta
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Imposta true se usi HTTPS
}));

// Serve i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

// Percorsi per i file JSON
const USERS_FILE = path.join(__dirname, 'user-save.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Inizializza i file JSON se non esistono
function initializeFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
  }
}
initializeFiles();

// Helper per leggere e scrivere file JSON
function readJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/* ========================================
   API REST per Registration, Login, Session e Logout
   ======================================== */

// Registrazione - POST /register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    return res.status(400).json({ success: false, message: "Username and password required." });
  }

  try {
    let users = await readJSON(USERS_FILE);
    if (users.find(user => user.username === username)) {
      return res.json({ success: false, message: "Username already exists." });
    }
    const newUser = { username, password, registeredAt: new Date().toISOString() };
    users.push(newUser);
    await writeJSON(USERS_FILE, users);
    res.json({ success: true, message: "Registration successful." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// Login - POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    return res.status(400).json({ success: false, message: "Username and password required." });
  }

  try {
    let users = await readJSON(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.json({ success: false, message: "Invalid username or password." });
    }
    // Crea la sessione salvando l'utente
    req.session.user = { username };
    res.json({ success: true, message: "Login successful." });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// Controllo sessione - GET /session
app.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout - POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: "Logout failed." });
    res.json({ success: true, message: "Logout successful." });
  });
});

// Recupera tutti i messaggi - GET /messages
app.get('/messages', async (req, res) => {
  try {
    let messages = await readJSON(MESSAGES_FILE);
    res.json({ success: true, messages });
  } catch(err) {
    console.error("Error retrieving messages:", err);
    res.status(500).json({ success: false, message: "Unable to retrieve messages." });
  }
});

// Cancella la chat (svuota messaggi) - POST /clearMessages
app.post('/clearMessages', async (req, res) => {
  try {
    await writeJSON(MESSAGES_FILE, []);
    // Informa tutti i client di aver cancellato la chat
    io.emit('clearChat');
    res.json({ success: true, message: "Chat cleared." });
  } catch(err) {
    console.error("Error clearing chat:", err);
    res.status(500).json({ success: false, message: "Error clearing chat." });
  }
});

/* ========================================
   Socket.io: Comunicazione in tempo reale
   ======================================== */

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on('userLogin', (data) => {
    console.log(`User logged in: ${data.username}`);
    onlineUsers.push({ socketId: socket.id, username: data.username, time: data.time });
    io.emit('updateOnlineUsers', onlineUsers.map(user => ({ username: user.username, time: user.time })));
  });

  socket.on('newMessage', async (data) => {
    console.log(`New message from ${data.username}`);
    try {
      let messages = await readJSON(MESSAGES_FILE);
      messages.push(data);
      await writeJSON(MESSAGES_FILE, messages);
    } catch (err) {
      console.error("Error saving message:", err);
    }
    io.emit('broadcastMessage', data);
  });

  socket.on('bell', () => {
    io.emit('ringBell');
  });

  socket.on('disconnect', () => {
    console.log("Socket disconnected:", socket.id);
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit('updateOnlineUsers', onlineUsers.map(user => ({ username: user.username, time: user.time })));
  });
});

/* ========================================
   Avvio del Server
   ======================================== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
