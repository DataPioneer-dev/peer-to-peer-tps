const startButton = document.getElementById("startButton");
const sendButton = document.getElementById("sendButton");
const closeButton = document.getElementById("closeButton");
const messageInput = document.getElementById("dataChannelSend");
const receiveArea = document.getElementById("dataChannelReceive");
let websocket;

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

startButton.onclick = function() {
  messageInput.disabled = false;
  messageInput.focus();
  messageInput.placeholder = "";
  startButton.disabled = true;
  sendButton.disabled = false;
  closeButton.disabled = false;

  websocket = new WebSocket("ws://localhost:8080");

  websocket.onopen = function() {
    console.log("WebSocket ouvert");
  };

  websocket.onmessage = function(event) {
    const parsedMessage = JSON.parse(event.data);
    receiveArea.value += parsedMessage.text + "\n";
  };

  websocket.onerror = function(error) {
    console.error("WebSocket error:", error);
  };
};

sendButton.onclick = function() {
  const message = messageInput.value;
  messageInput.value = "";
  websocket.send(JSON.stringify({ type: "message", text: message }));
};

closeButton.onclick = function() {
  websocket.close();
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = "";
  dataChannelReceive.value = "";
  dataChannelSend.disabled = true;
  dataChannelSend.placeholder = "1: Press Start; 2: Enter text; \n3: Press Send.";
};