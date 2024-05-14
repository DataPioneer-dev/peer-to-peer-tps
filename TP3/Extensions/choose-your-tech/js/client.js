var div = document.getElementById('scratchPad');
var chosenTechnology = prompt("Enter preferred technology (XHR, WebSocket, Socket.io):");
var channel = prompt("Enter signaling channel name:");


if (channel !== "") {
    var FirstTime = true;
    console.log('Trying to create or join channel: ', channel);
    createOrJoinChannel(channel, FirstTime, chosenTechnology);
}

function createOrJoinChannel(channel, FirstTime, chosenTechnology) {
    switch(chosenTechnology) {
        case 'XHR':
            createOrJoinChannelXHR(channel, FirstTime);
            break;
        case 'WebSocket':
            createOrJoinChannelWebSocket(channel);
            break;
        case 'Socket.io':
            createOrJoinChannelSocketIO(channel);
            break;
        default:
            console.error("Invalid technology choice.");
            return;
    }
}

function createOrJoinChannelXHR(channel, FirstTime) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/message');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var message = JSON.parse(xhr.responseText);
            console.log('Received message:', message);
    
            switch (message.type) {
                case 'created':
                        handleResponseCasCreated(message);
                        break;
                    case 'full':
                        handleResponseCasFull(message);
                        break;
                    case 'remotePeerJoining':
                        handleResponseCasRemotePeerJoiningXHR(message, xhr);
                        break;
                    case 'joined':
                        handleResponseCasJoinedXHR(xhr);
                        break;
                    case 'broadcast:joined':
                        handleResponseCasBroadcastJoinedXHR(xhr);
                        break;
                    case 'log':
                        console.log.apply(console, message.array);
                        break;
                    case 'message':
                        handleResponseCasMessageXHR(message, xhr);
                        break;
                    case 'response':
                        handleResponseCasResponseXHR(message, xhr);
                        break;
                    case 'Bye':
                        handleResponseCasByeXHR(xhr);
                        break;
                }
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
    xhr.onerror = function() {
        console.error('Request failed');
    };
    xhr.send(JSON.stringify({ type: 'create or join', channel: channel }));
}

function createOrJoinChannelWebSocket(channel, FirstTime) {
    var ws = new WebSocket('ws://localhost:8081');

    ws.onopen = function() {
        console.log('WebSocket connection established.');
        ws.send(JSON.stringify({ type: 'create or join', channel: channel }));
    };

    ws.onmessage = function(event) {
        var message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
            case 'created':
                handleResponseCasCreated(message);
                break;
            case 'full':
                handleResponseCasFull(message);
                break;
            case 'remotePeerJoining':
                handleResponseCasRemotePeerJoining(message);
                break;
            case 'joined':
                handleResponseCasJoinedWS(event);
                break;
            case 'broadcast:joined':
                handleResponseCasBroadcastJoinedWS(event, ws);
                break;
            case 'log':
                console.log.apply(console, message.array);
                break;
            case 'message':
                handleResponseCasMessageWS(message, ws);
                break;
            case 'response':
                handleResponseCasResponseWS(message, ws)
                break;
            case 'Bye':
                handleResponseCasByeWS(ws);
                break;
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

}

function createOrJoinChannelSocketIO(channel) {
    var socket = io.connect('http://localhost:8181');

    if (channel !== "") {
        console.log('Trying to create or join channel: ', channel);
        socket.emit('create or join', channel);
        message = JSON.parse(JSON.stringify({channel: channel}));

    }
    
    socket.on('created', function (channel){
        handleResponseCasCreatedSocket(channel);
    });
    
    socket.on('full', function (channel){
        handleResponseCasFull(channel);
    });
    
    socket.on('remotePeerJoining', function (channel){
        handleResponseCasRemotePeerJoiningSocket(channel)
    });
    
    socket.on('broadcast:joined', function (message){
        handleResponseCasBroadcastJoinedSocket(message, socket);
    });
    
    socket.on('log', function (array){
        console.log.apply(console, array);
    });
    
    socket.on('message', function (message){
        handleResponseCasMessageSocket(message, socket);
    });
    
    socket.on('response', function (response){
        handleResponseCasResponseSocket(response, socket);
    });
    
    socket.on('Bye', function (){
        handleResponseCasByeSocket(socket);
    });
}

function handleResponseCasCreated(message) {
    console.log('channel ' + message.channel + ' has been created!');
    console.log('This peer is the initiator...');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Channel ' +
        message.channel + ' has been created! </p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> This peer is the initiator...</p>');
}

function handleResponseCasCreatedSocket(channel) {
    console.log('channel ' + channel + ' has been created!');
    console.log('This peer is the initiator...');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Channel ' +
        channel + ' has been created! </p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> This peer is the initiator...</p>');
}

function handleResponseCasFull(message) {
    console.log('channel ' + message.channel + ' is too crowded! Cannot allow you to enter, sorry :-(');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> channel ' + message.channel + ' is too crowded! Cannot allow you to enter, sorry :-( </p>');
}

function handleResponseCasFullSocket(channel) {
    console.log('channel ' + channel + ' is too crowded! Cannot allow you to enter, sorry :-(');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> channel ' + channel + ' is too crowded! Cannot allow you to enter, sorry :-( </p>');
}

function handleResponseCasRemotePeerJoiningXHR(message, xhr) {
    console.log('Request to join ' + message.channel);
    console.log('You are the initiator!');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: request to join channel ' +
        message.channel + '</p>');
    sendMessageXHR(JSON.stringify({type: 'craete or join', channel: channel, FirstTime: false}), xhr);
}

function handleResponseCasRemotePeerJoiningSocket(channel) {
    console.log('Request to join ' + channel);
    console.log('You are the initiator!');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: request to join channel ' +
        channel + '</p>');
}

function handleResponseCasRemotePeerJoining(message) {
    console.log('Request to join ' + message.channel);
    console.log('You are the initiator!');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: request to join channel ' +
        message.channel + '</p>');
}

function handleResponseCasJoinedXHR(xhr) {
    console.log('Message from server: ' + xhr.responseText);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + xhr.responseText + '</p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + xhr.responseText + '</p>');
}

function handleResponseCasJoinedWS(event) {
    console.log('Message from server: ' + event.data);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + event.data + '</p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + event.data + '</p>');
}

function handleResponseCasBroadcastJoinedXHR(xhr) {
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Broadcast message from server: </p>');
    div.insertAdjacentHTML('before+End', '<p style="color:red">' + xhr.responseText + '</p>');
    console.log('Broadcast message from server: ' + xhr.responseText);
    var myMessage = prompt('Insert message to be sent to your peer:', "");
    sendMessageXHR(JSON.stringify({ type: 'message', message: myMessage, channel: channel}), xhr);
}

function handleResponseCasBroadcastJoinedSocket(message, socket) {
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Broadcast message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">' + message + '</p>');
    console.log('Broadcast message from server: ' + message);
    var messageNull = true;
    while (messageNull) {
        var myMessage = prompt('Insert message to be sent to your peer:', "");
        if (myMessage) {
            messageNull = false;
        }
    }
    socket.emit('message', JSON.stringify({ message: myMessage, channel: channel}));
}

function handleResponseCasBroadcastJoinedWS(event, ws) {
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Broadcast message from server: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">' + event.data + '</p>');
    console.log('Broadcast message from server: ' + event.data);
    var messageNull = true;
    while (messageNull) {
        var myMessage = prompt('Insert message to be sent to your peer:', "");
        if (myMessage) {
            messageNull = false;
        }
    }
    sendMessageWS(JSON.stringify({ type: 'message', message: myMessage, channel: channel}), ws);
}

function handleResponseCasMessageXHR(message, xhr) {
    console.log('Got message from other peer: ' + message.message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got message from other peer: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + message.message + '</p>');
    var myResponse = prompt('Send response to other peer:', "");
    sendMessageXHR(JSON.stringify({ type: 'response', message: myResponse, channel: channel}), xhr);
}

function handleResponseCasMessageWS(message, ws) {
    console.log('Got message from other peer: ' + message.message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got message from other peer: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + message.message + '</p>');
    var messageNull = true;
    while (messageNull) {
        var myResponse = prompt('Send response to other peer:', "");
        if (myResponse) {
            messageNull = false;
        }
    }
    sendMessageWS(JSON.stringify({ type: 'response', message: myResponse, channel: channel}), ws);
}

function handleResponseCasMessageSocket(message, socket) {
    console.log('Got message from other peer: ' + message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got message from other peer: </p>');
    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + message + '</p>');
    var messageNull = true;
    while (messageNull) {
        var myResponse = prompt('Send response to other peer:', "");
        if (myResponse) {
            messageNull = false;
        }
    }
    socket.emit('response' ,JSON.stringify({message: myResponse, channel: channel}));
}

function handleResponseCasResponseXHR(message, xhr) {
    console.log('Got response from other peer: ' + message.message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Got response from other peer: </p>');
        div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' +
        message.message + '</p>');
    var chatMessage = prompt('Keep on chatting. Write "Bye" to quit conversation', "");
    if (chatMessage === "Bye") {
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Sending "Bye" to server...</p>');
        console.log('Sending "Bye" to server');
        sendMessageXHR(JSON.stringify({ type: 'Bye', channel: message.channel }), xhr);
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
        console.log('Going to disconnect...');
        xhr.close();
    } else {
        sendMessageXHR(JSON.stringify({ type: 'response', message: chatMessage, channel: channel}), xhr);
    }
}

function handleResponseCasResponseWS(message, ws) {
    console.log('Got response from other peer: ' + message.message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Got response from other peer: </p>');
        div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' +
        message.message + '</p>');
    var messageNull = true;
    while (messageNull) {
        var chatMessage = prompt('Keep on chatting. Write "Bye" to quit conversation', "");
        if (chatMessage) {
            messageNull = false;
        }
    }
    if (chatMessage === "Bye") {
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Sending "Bye" to server...</p>');
        console.log('Sending "Bye" to server');
        sendMessageWS(JSON.stringify({ type: 'Bye', channel: message.channel }), ws);
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
        console.log('Going to disconnect...');
        ws.close();
    } else {
        sendMessageWS(JSON.stringify({ type: 'response', message: chatMessage, channel: channel}), ws);
    }
}

function handleResponseCasResponseSocket(message, socket) {
    console.log('Got response from other peer: ' + message);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Got response from other peer: </p>');
        div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' +
        message + '</p>');
    var messageNull = true;
    while (messageNull) {
        var chatMessage = prompt('Keep on chatting. Write "Bye" to quit conversation', "");
        if (chatMessage) {
            messageNull = false;
        }
    }
    if (chatMessage === "Bye") {
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Sending "Bye" to server...</p>');
        console.log('Sending "Bye" to server');
        socket.emit('Bye', JSON.stringify({ channel: channel }));
        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
            (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
        console.log('Going to disconnect...');
        socket.disconnect();
    } else {
        socket.emit('response', JSON.stringify({message: chatMessage, channel: channel}));
    }
}

function handleResponseCasByeXHR(xhr) {
    console.log('Got "Bye" from other peer! Going to disconnect...');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got "Bye" from other peer!</p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Sending "Ack" to server</p>');
    console.log('Sending "Ack" to server');
    sendMessageXHR(JSON.stringify({ type: 'Ack' }), xhr);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
    console.log('Going to disconnect...');
    xhr.close();
}

function handleResponseCasByeWS(ws) {
    console.log('Got "Bye" from other peer! Going to disconnect...');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got "Bye" from other peer!</p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Sending "Ack" to server</p>');
    console.log('Sending "Ack" to server');
    sendMessageWS(JSON.stringify({ type: 'Ack' }), ws);
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
    console.log('Going to disconnect...');
    ws.close();
}

function handleResponseCasByeSocket(socket) {
    console.log('Got "Bye" from other peer! Going to disconnect...');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Got "Bye" from other peer!</p>');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) +
        ' --> Sending "Ack" to server</p>');
    console.log('Sending "Ack" to server');
    socket.emit('Ack');
    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
        (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
    console.log('Going to disconnect...');
    socket.disconnect();
}

function sendMessageXHR(message, xhr) {
    xhr.send(message);
}

function sendMessageWS(message, ws) {
    ws.send(message);
}

