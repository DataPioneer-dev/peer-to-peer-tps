var div = document.getElementById('scratchPad');
var channel = prompt("Enter signaling channel name:");
var xhr = new XMLHttpRequest();

if (channel !== "") {
    console.log('Trying to create or join channel: ', channel);
    createOrJoinChannel(channel);
}

function createOrJoinChannel(channel) {
    xhr.open('POST', 'http://localhost:8181/message');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var message = JSON.parse(xhr.responseText);
            console.log('Received message:', message);
            handleSignalingMessage(message);
            pollMessages(); // Start polling for messages after creating or joining channel
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
    xhr.onerror = function() {
        console.error('Request failed');
    };
    xhr.send(JSON.stringify({ type: 'create or join', channel: channel }));
}

function handleSignalingMessage(message) {
    switch (message.type) {
        case 'created':
            onChannelCreated(message.channel);
            break;
        case 'full':
            onChannelFull(message.channel);
            break;
        case 'peerJoined':
            onRemotePeerJoining(message.channel);
            break;
        case 'joined':
            onChannelJoined(message.channel);
            break;
        case 'message':
            onMessageReceived(message.message);
            break;
        case 'response':
            onResponseReceived(message.message);
            break;
        case 'Bye':
            onBye(message.channel);
            break;
        default:
            console.error('Unhandled message type:', message.type);
    }
}

function onChannelCreated(channel) {
    console.log('Channel ' + channel + ' has been created!');
    div.insertAdjacentHTML('beforeEnd', `<p>Channel ${channel} has been created!</p>`);
}

function onChannelJoined(channel) {
    console.log('Joined channel ' + channel);
    div.insertAdjacentHTML('beforeEnd', `<p>Joined channel ${channel}</p>`);
    sendMessage({ type: 'message', message: 'Hello from the joined peer!', channel: channel });
}

function onChannelFull(channel) {
    console.log('Channel ' + channel + ' is full!');
    div.insertAdjacentHTML('beforeEnd', `<p>Channel ${channel} is full!</p>`);
}

function onRemotePeerJoining(channel) {
    console.log('Request to join ' + channel);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:red">Request to join channel ${channel}</p>`);
    var myMessage = prompt('Insert message to be sent to your peer:', "");
    sendMessage({ type: 'message', message: myMessage, channel: channel });
}

function onMessageReceived(message) {
    console.log('Got message from other peer: ' + message);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:blue">Got message from other peer: ${message}</p>`);
    var myResponse = prompt('Send response to other peer:', "");
    sendMessage({ type: 'response', message: myResponse, channel: channel });
}

function onResponseReceived(message) {
    console.log('Got response from other peer: ' + message);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:blue">Got response from other peer: ${message}</p>`);
    var chatMessage = prompt('Keep on chatting. Write "Bye" to quit conversation', "");
    if (chatMessage === "Bye") {
        console.log('Sending "Bye" to server');
        sendMessage({ type: 'Bye', channel: channel });
    } else {
        sendMessage({ type: 'response', message: chatMessage, channel: channel });
    }
}

function onBye(channel) {
    console.log('Got "Bye" from other peer! Going to disconnect...');
    div.insertAdjacentHTML('beforeEnd', '<p>Got "Bye" from other peer! Disconnecting...</p>');
    sendMessage({ type: 'Ack', channel: channel });
}

function sendMessage(message) {
    var xhrMessage = new XMLHttpRequest();
    xhrMessage.open('POST', 'http://localhost:8181/message');
    xhrMessage.setRequestHeader('Content-Type', 'application/json');
    xhrMessage.send(JSON.stringify(message));
}

function pollMessages() {
    var xhrPoll = new XMLHttpRequest();
    xhrPoll.open('GET', `http://localhost:8181/message?channel=${channel}`, true);
    xhrPoll.onload = function() {
        if (xhrPoll.status === 200) {
            const messages = JSON.parse(xhrPoll.responseText);
            messages.forEach(message => handleSignalingMessage(message));
        }
        setTimeout(pollMessages, 1000); // Poll every second
    };
    xhrPoll.send();
}
