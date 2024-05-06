var div = document.getElementById('scratchPad');
var channel = prompt("Enter signaling channel name:");
var ws;

if (channel !== "") {
    console.log('Trying to create or join channel: ', channel);
    createOrJoinChannel(channel);
}

function createOrJoinChannel(channel) {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = function() {
        console.log('WebSocket connection established.');
        ws.send(JSON.stringify({ type: 'create or join', channel: channel }));
    };

    ws.onmessage = function(event) {
        var message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
            case 'created':
                console.log('channel ' + message.channel + ' has been created!');
                console.log('This peer is the initiator...');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) + ' --> Channel ' +
                    message.channel + ' has been created! </p>');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> This peer is the initiator...</p>');
                break;
            case 'full':
                console.log('channel ' + message.channel + ' is too crowded! Cannot allow you to enter, sorry :-(');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) + ' --> channel ' + message.channel + ' is too crowded! Cannot allow you to enter, sorry :-( </p>');
                break;
            case 'remotePeerJoining':
                console.log('Request to join ' + message.channel);
                div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> Message from server: request to join channel ' +
                    message.channel + '</p>');
                break;
            case 'joined':
                console.log('Message from server: ' + event.data);
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> Message from server: </p>');
                div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + event.data + '</p>');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> Message from server: </p>');
                div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + event.data + '</p>');
                break;
            case 'broadcast:joined':
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
                ws.send(JSON.stringify({ type: 'message', message: myMessage, channel: channel }));
                break;
            case 'log':
                console.log.apply(console, message.array);
                break;
            case 'message':
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
                ws.send(JSON.stringify({ type: 'response', message: myResponse, channel: channel }));
                break;
            case 'response':
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
                    ws.send(JSON.stringify({ type: 'Bye', channel: message.channel }));
                    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                        (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
                    console.log('Going to disconnect...');
                    ws.close();
                } else {
                    ws.send(JSON.stringify({ type: 'response', message: chatMessage, channel: channel }));
                }
                break;
            case 'Bye':
                console.log('Got "Bye" from other peer! Going to disconnect...');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> Got "Bye" from other peer!</p>');
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) +
                    ' --> Sending "Ack" to server</p>');
                console.log('Sending "Ack" to server');
                ws.send(JSON.stringify({ type: 'Ack' }));
                div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                    (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
                console.log('Going to disconnect...');
                ws.close();
                break;
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}


