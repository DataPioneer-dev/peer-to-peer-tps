const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8181;

const clients = {};

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://127.0.0.1:5500', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.options('/message', (req, res) => {
    res.sendStatus(200);
});

app.post('/message', (req, res) => {
    try {
        const data = req.body;
        const channel = data.channel;

        if (!clients[channel]) {
            clients[channel] = [];
        }

        handlePostMessage(channel, data, req, res);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send('Invalid request');
    }
});

app.get('/message', (req, res) => {
    const channel = req.query.channel;
    if (channel && clients[channel]) {
        res.status(200).json(clients[channel].map(client => client.messages).flat());
        clients[channel].forEach(client => client.messages = []); 
    } else {
        res.status(404).send('Channel not found');
    }
});

function handlePostMessage(channel, data, req, res) {
    switch (data.type) {
        case 'create or join':
            handleCreateOrJoin(channel, req, res);
            break;
        case 'message':
        case 'response':
        case 'Bye':
        case 'Ack':
            broadcastMessage(channel, data, req);
            res.sendStatus(200);
            break;
        default:
            res.status(400).send('Invalid message type');
            break;
    }
}

function handleCreateOrJoin(channel, req, res) {
    const numClients = clients[channel].length;
    clients[channel].push({ address: req.ip, res, messages: [] });

    if (numClients === 0) {
        res.status(200).json({ type: 'created', channel: channel });
    } else if (numClients === 1) {
        res.status(200).json({ type: 'joined', channel: channel });

        clients[channel].forEach(client => {
            if (client.address !== req.ip) {
                client.messages.push({ type: 'peerJoined', channel: channel });
            }
        });
    } else {
        res.status(200).json({ type: 'full', channel: channel });
    }
}

function broadcastMessage(channel, data, req) {
    clients[channel].forEach(client => {
        if (client.address !== req.ip) {
            client.messages.push(data);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
