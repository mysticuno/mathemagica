var express = require('express');
var app = express();
var path = require('path');

var server = require('http').createServer(app);
// var io = require('socket.io')(server);



var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame;

// viewed at http://localhost:8080

// io.on('connection', (socket) => {
//  //console.log("Client connected!");
//  socket.on('message-from-client-to-server', (msg) => {
//  console.log(msg);
//  })
//  socket.emit('message-from-server-to-client', 'Hello World!');
// });

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/views/index.html')
});

board.on('ready', function() {
    led = new five.Led(13);    
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data); 
        if (frame.hands && frame.hands.length > 1) {
            led.on();
        }
        else {
            led.off();
        }
    });
});

app.listen(8080);