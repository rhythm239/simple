const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let status = 'unavailable'; // default status

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current status to the connected client
  socket.emit('status', status);

  // Listen for status changes from the client
  socket.on('toggleStatus', () => {
    status = (status === 'available') ? 'unavailable' : 'available';
    io.emit('status', status); // Broadcast the status to all clients
    fs.writeFileSync('status.txt', status); // Save status to file
  });

  // Load status from file if it exists
  if (fs.existsSync('status.txt')) {
    status = fs.readFileSync('status.txt', 'utf8');
    socket.emit('status', status);
  }

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
