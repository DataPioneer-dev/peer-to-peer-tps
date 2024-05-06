var div = document.getElementById('scratchPad');
var channel = prompt("Enter signaling channel name:");
var xhr = new XMLHttpRequest();


if (channel !== "") {
    var FirstTime = true;
    console.log('Trying to create or join channel: ', channel);
    createOrJoinChannel(channel, FirstTime);
}

function createOrJoinChannel(channel, FirstTime) {
    xhr.open('POST', 'http://localhost:8181/message');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log(xhr.status);
            var message = JSON.parse(xhr.responseText);
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
                case 'remotePeerJoining and broadcast:joined':
                    console.log('Request to join ' + message.channel);
                    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
                        (performance.now() / 1000).toFixed(3) +
                        ' --> Message from server: request to join channel ' +
                        message.channel + '</p>');
                    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">Time: ' +
                        (performance.now() / 1000).toFixed(3) +
                        ' --> Broadcast message from server: </p>');
                    div.insertAdjacentHTML('beforeEnd', '<p style="color:red">' + xhr.responseText + '</p>');
                    console.log('Broadcast message from server: ' + xhr.responseText);
                    var myMessage = prompt('Insert message to be sent to your peer:', "");
                    sendMessage(JSON.stringify({ type: 'message', message: myMessage, channel: channel}));
                    break;
                case 'joined':
                    console.log('Message from server: ' + xhr.responseText);
                    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                        (performance.now() / 1000).toFixed(3) +
                        ' --> Message from server: </p>');
                    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + xhr.responseText + '</p>');
                    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                        (performance.now() / 1000).toFixed(3) +
                        ' --> Message from server: </p>');
                    div.insertAdjacentHTML('beforeEnd', '<p style="color:blue">' + xhr.responseText + '</p>');
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
                    var myResponse = prompt('Send response to other peer:', "");
                    sendMessage(JSON.stringify({ type: 'response', message: myResponse, channel: channel}));
                    break;
                case 'response':
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
                        sendMessage(JSON.stringify({ type: 'Bye', channel: message.channel }));
                        div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                            (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
                        console.log('Going to disconnect...');
                        xhr.close();
                    } else {
                        sendMessage(JSON.stringify({ type: 'response', message: chatMessage, channel: channel}));
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
                    sendMessage(JSON.stringify({ type: 'Ack' }));
                    div.insertAdjacentHTML('beforeEnd', '<p>Time: ' +
                        (performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
                    console.log('Going to disconnect...');
                    xhr.close();
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

function sendMessage(message) {
    var xhrMessage = new XMLHttpRequest();
    xhrMessage.open('POST', 'http://localhost:8181/message');
    xhrMessage.setRequestHeader('Content-Type', 'application/json');
    xhrMessage.send(message);
}



