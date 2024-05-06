const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(express.static('public'));

let connectedUsers = [];

app.get('/start', (req, res) => {
  connectedUsers.push(req.ip);
  console.log('New user connected:', req.ip);
  res.status(200).json({ text: 'Connection established.' });
});

app.post('/send', express.json(), (req, res) => {
  const message = req.body.text;
  console.log('Message received:', message);
  res.status(200).json({ text: message });
});

app.get('/close', (req, res) => {
  connectedUsers = connectedUsers.filter(user => user !== req.ip);
  console.log('User disconnected:', req.ip);
  res.status(200).json({ text: 'Connection closed.' });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});
