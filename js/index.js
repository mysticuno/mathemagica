// Make sure you have the leap motion service running otherwise you'll get an error
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var webSocket = require('ws');

app.use("/public", express.static(__dirname + "/public"));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    console.log("Serving " + __dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('connected to websocket');
    socket.on('disconnect', function() {
        console.log('websocket disconnected');
    });

    socket.on('line hover', function(msg) {
        console.log("hovering over a line " + msg.data);
        if (led) {
            led.on();
        }
    });

    socket.on('line unhover', function(msg) {
        console.log("unhovering over a line " + msg.data);
         if (led) {
            led.off();
        }
    });

});

var ws = new webSocket('ws://127.0.0.1:6437'),
    SerialPort = require("serialport"),
    five = require('johnny-five'),
    port = new SerialPort("/dev/ttyS5"),
    board = new five.Board({port: port}),
    led, frame;
//console.log(SerialPort);
//COM_PORT = new SerialPort("COM7", {baudrate: 9600, buffersize: 1}),
SerialPort.list(function (err, ports) {
		console.log(err,ports);
});
//var port = new SerialPort("/dev/ttyS7", {baudRate: 9600});
//var board = new five.Board({port: port}),
//    led, frame;

// Will need to address Windows/OSX/Linux ports https://github.com/rwaldron/johnny-five/wiki/Board


board.on('ready', function() {
    led = new five.Led(13);    
    /*ws.on('message', function(data, flags) {
        frame = JSON.parse(data); 
        if (frame.hands && frame.hands.length == 1) {
            led.on();
        } else {
            led.off();
        }
    });*/
});

http.listen(3000, function() {
    console.log("listening on *:3000");
});