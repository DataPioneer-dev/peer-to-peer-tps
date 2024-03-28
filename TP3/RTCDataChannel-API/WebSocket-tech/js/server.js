const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "message") {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", text: parsedMessage.text }));
        }
      });
    }
  });
});
