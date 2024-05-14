const startButton = document.getElementById("startButton");
const sendButton = document.getElementById("sendButton");
const closeButton = document.getElementById("closeButton");
const messageInput = document.getElementById("dataChannelSend");
const receiveArea = document.getElementById("dataChannelReceive");
let xhr;

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

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log("XHR connected");
      } else {
        console.error("XHR error:", xhr.status);
      }
    }
  };
  xhr.open("GET", "http://localhost:8080/start", true);
  xhr.send();

  xhr.addEventListener("load", function() {
    const response = JSON.parse(xhr.responseText);
    receiveArea.value += response.text + "\n"; // Afficher le texte de réponse dans la receiveArea
  });

  xhr.onerror = function() {
    console.error("XHR error");
  };
};

sendButton.onclick = function() {
  const message = messageInput.value;
  messageInput.value = "";
  receiveArea.value += message + "\n";
  xhr = new XMLHttpRequest(); 
  xhr.open("POST", "http://localhost:8080/send", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ type: "message", text: message }));

  xhr.onload = function() {
    console.log("Message sent via XHR");
  };

  xhr.onerror = function() {
    console.error("XHR error");
  };
};

closeButton.onclick = function() {
  xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8080/close", true);
  xhr.send();

  xhr.onload = function() {
    console.log("XHR connection closed");
  };

  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = "";
  dataChannelReceive.value = "";
  dataChannelSend.disabled = true;
  dataChannelSend.placeholder = "1: Press Start; 2: Enter text; \n3: Press Send.";
};
