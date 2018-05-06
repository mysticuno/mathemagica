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

/*    socket.on('line hover', function(msg) {
        console.log("hovering over a line ");
        if (led) {
            led.on();
        }
    });

    socket.on('line unhover', function(msg) {
        console.log("unhovering");
         if (led) {
            led.off();
        }
    });*/

    socket.on('thumb enter', function() {
        console.log('Thumb is hovering over line');
        if (thumbLed) {
            thumbLed.on();
        }
    });

    socket.on('thumb leave', function() {
        console.log("Thumb left");
        if (thumbLed) {
            thumbLed.off();
        }
    });

    socket.on('index enter', function() {
        console.log('Index is hovering over line');
        if (indexLed) {
            indexLed.on();
        }
    });

    socket.on('index leave', function() {
        console.log("Index left");
        if (indexLed) {
            indexLed.off();
        }
    });

    socket.on('middle enter', function() {
        console.log('middle is hovering over line');
        if (middleLed) {
            middleLed.on();
        }
    });

    socket.on('middle leave', function() {
        console.log("middle left");
        if (middleLed) {
            middleLed.off();
        }
    });

    socket.on('ring enter', function() {
        console.log('ring is hovering over line');
        if (ringLed) {
           ringLed.on();
        }
    });

    socket.on('ring leave', function() {
        console.log("ring left");
        if (ringLed) {
            ringLed.off();
        }
    });

});

var ws = new webSocket('ws://127.0.0.1:6437'),
    SerialPort = require("serialport"),
    five = require('johnny-five'),
//    port = new SerialPort("/dev/ttyS11"),
//    board = new five.Board({port: port}),
    thumbLed, indexLed, middleLed, ringLed, frame;
//console.log(SerialPort);
//COM_PORT = new SerialPort("COM5", {baudrate: 9600, buffersize: 1}),
SerialPort.list(function (err, ports) {
		console.log(ports);
});
var port = new SerialPort("/dev/ttyS5", {baudRate: 9600});
var board = new five.Board({port: port});
//    led, frame;

// Will need to address Windows/OSX/Linux ports https://github.com/rwaldron/johnny-five/wiki/Board
board.on('ready', function() {
   thumbLed = new five.Led(12);
   indexLed = new five.Led(11);
   middleLed = new five.Led(10);
   ringLed = new five.Led(9);
});

http.listen(3000, function() {
    console.log("listening on *:3000");
});
