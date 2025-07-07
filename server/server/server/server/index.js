const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
require('./cleanup');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Group creation endpoint
app.get('/create-group', (req, res) => {
  const groupId = Math.random().toString(36).substring(2, 8);
  db.run('INSERT INTO groups(id) VALUES (?)', [groupId], (err) => {
    if (err) return res.status(500).send('Error creating group');
    res.send({ groupId });
  });
});

io.on('connection', (socket) => {
  socket.on('join-group', ({ groupId }) => {
    socket.join(groupId);
  });

  socket.on('send-message', ({ groupId, anonId, content }) => {
    const timestamp = new Date().toISOString();
    db.run(
      `INSERT INTO messages (group_id, anon_id, content, timestamp) VALUES (?, ?, ?, ?)`,
      [groupId, anonId, content, timestamp]
    );
    io.to(groupId).emit('new-message', { groupId, anonId, content, timestamp });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

