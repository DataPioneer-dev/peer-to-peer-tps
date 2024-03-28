const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data_ws, isBinary) {
        const message = isBinary ? data_ws : data_ws.toString();
        console.log('Received message:', message);
        var data = JSON.parse(message);
        switch (data.type) {
            case 'create or join':
                var numClients = wss.clients.size;
                var channel = data.channel;
                if (numClients == 1) {
                    ws.channel = channel;
                    ws.send(JSON.stringify({ type: 'created', channel: channel }));
                } else if (numClients == 2) {
                    wss.clients.forEach(function(client) {
                        if (client !== ws && client.channel === channel) {
                            client.send(JSON.stringify({ type: 'remotePeerJoining', channel: channel }));
                            ws.channel = channel;
                            ws.send(JSON.stringify({ type: 'broadcast:joined', message: 'S --> broadcast(): client ' + ws + ' joined channel ' + channel, channel: channel }));
                        }
                    });
                } else {
                    ws.send(JSON.stringify({ type: 'full', channel: channel }));
                }
                break;
            case 'message': 
                wss.clients.forEach(function(client) {
                    if (client !== ws && client.channel === data.channel) {
                        log('S --> Got message: ', data.message);
                        client.send(JSON.stringify({ type: 'message', message: data.message, channel: client.channel }));
                    }
                });
                break;
            case 'response':
                wss.clients.forEach(function(client) {
                    if (client !== ws && client.channel === data.channel) {
                        log('S --> Got response: ', data.message);
                        client.send(JSON.stringify({ type: 'response', message: data.message, channel: client.channel }));
                    }
                });
                break;
            case 'Bye':
                wss.clients.forEach(function(client) {
                    if (client !== ws && client.channel === data.channel) {
                        client.send(JSON.stringify({ type: 'Bye' }));
                    }
                });
                ws.close();
                break;
            case 'Ack':
                console.log('Got an Ack!');
                ws.close();
                break;
        }
    });

    ws.on('error', function(error) {
        console.error('WebSocket error:', error);
    });

    function log() {
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        ws.send(JSON.stringify({ type: 'log', array: array }));
    }
});