const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS' && req.url === '/message') {
        res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(200);
        res.end();
    } else if (req.method === 'POST' && req.url === '/message') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                var channel = data.channel;
                switch (data.type) {
                    case 'create or join':
                        var numClients = Object.keys(clients).length;
                        if (numClients === 0) {
                            clients[req.socket.remoteAddress] = channel;
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ type: 'created', channel: channel }));
                        } else if (numClients === 1) {
                            let remotePeerFound = false;
                            clients[req.socket.remoteAddress] = channel;
                            for (const clientId in clients) {
                                if (clients[clientId] === channel && clientId === req.socket.remoteAddress) {
                                    remotePeerFound = true;
                                    if (data.FirstTime) {
                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify({ type: 'remotePeerJoining', channel: channel }) + '\n');
                                    } else {
                                        // Send the response before allowing to send another message
                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        const broadcastMessage = 'S --> broadcast(): client ' + req.socket.remoteAddress + ' joined channel ' + channel;
                                        const broadcastData = { type: 'broadcast:joined', message: broadcastMessage, channel: channel };
                                        res.end(JSON.stringify(broadcastData));
                                    }
                                }
                            }
                            if (!remotePeerFound) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ type: 'full', channel: channel }));
                            }
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ type: 'full', channel: channel }));
                        }
                        break;
                    case 'message':
                        for (const clientId in clients) {
                            if (clients[clientId] === channel && clientId !== req.socket.remoteAddress) {
                                log('S --> Got message:', data.message);
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ type: 'message', message: data.message, channel: channel }));
                            }
                        }
                        break;
                    case 'response':
                        for (const clientId in clients) {
                            if (clients[clientId] === channel && clientId === req.socket.remoteAddress) {
                                log('S --> Got response:', data.message);
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ type: 'response', message: data.message, channel: channel }));
                            }
                        }
                        break;
                    case 'Bye':
                        for (const clientId in clients) {
                            if (clients[clientId] === channel && clientId === req.socket.remoteAddress) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ type: 'Bye' }));
                            }
                        }
                        delete clients[req.socket.remoteAddress];
                        break;
                    case 'Ack':
                        console.log('Got an Ack!');
                        res.writeHead(200);
                        res.end();
                        delete clients[req.socket.remoteAddress];
                        break;
                }
            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(400);
                res.end();
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }

    function log() {
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'log', array: array }));
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const clients = {};
