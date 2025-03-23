// server.js - Socket.io server for multiplayer goblin game
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Define a route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running!');
});

// Player tracking
const players = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);
  
  // Add new player
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * 10 - 5,
    y: 0,
    z: Math.random() * 10 - 5,
    rotation: 0,
    animation: 'idle',
    color: getRandomColor()
  };
  
  // Send current players to new player
  socket.emit('currentPlayers', players);
  
  // Tell other players about the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  
  // Handle player movement
  socket.on('playerMovement', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].z = movementData.z;
    players[socket.id].rotation = movementData.rotation;
    players[socket.id].animation = movementData.animation;
    
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Generate a random color for new players
function getRandomColor() {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A1',
    '#33FFF5', '#F5FF33', '#FF8033', '#8033FF', '#33FF80'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Start the server
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Use ngrok http 3002 to expose your server');
});

console.log('To make your server publicly accessible:');
console.log('1. Install ngrok: npm install -g ngrok');
console.log('2. Run: ngrok http 3002');
console.log('3. Share the HTTPS URL provided by ngrok with others');
