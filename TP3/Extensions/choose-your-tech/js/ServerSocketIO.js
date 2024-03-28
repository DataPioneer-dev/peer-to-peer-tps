var static = require('node-static');
var http = require('http');
var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8181);

var io = require('socket.io')(app);

io.sockets.on('connection', function (socket) {
  socket.on('message', function (message) {
    log('S --> Got message: ', message);
    var recu = JSON.parse(message); 
    socket.broadcast.to(recu.channel).emit('message', recu.message);
  });

  socket.on('create or join', function (channel) {
    var numClients = io.sockets.adapter.rooms[channel] ? io.sockets.adapter.rooms[channel].length : 0;
    if (numClients == 0) {
        socket.join(channel, function() {
            console.log("Client joined to the Channel");
        });
        socket.emit('created', channel);
    } else if (numClients == 1) {
        io.sockets.in(channel).emit('remotePeerJoining', channel);
        socket.join(channel);
        socket.emit('broadcast:joined', 'S --> broadcast(): client ' + socket.id + ' joined channel ' + channel);
    } else {
        console.log("Channel full!");
        socket.emit('full', channel);
    }
});

  socket.on('response', function (response) {
    log('S --> Got response: ', response);
    var recu = JSON.parse(response); 
    socket.broadcast.to(recu.channel).emit('response', recu.message);
  });

  socket.on('Bye', function (channel) {
    socket.broadcast.to(channel).emit('Bye');
    socket.emit('Bye');
    socket.disconnect();
  });

  socket.on('Ack', function () {
    console.log('Got an Ack!');
    socket.disconnect();
  });

  socket.on('error', function(error) {
   console.error("Erreur de socket : ", error);
  });

  function log() {
    var array = [">>> "];
    for (var i = 0; i < arguments.length; i++) {
      array.push(arguments[i]);
    }
    socket.emit('log', array);
  }
});
