// Make sure you have the leap motion service running otherwise you'll get an error
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var webSocket = require('ws');

// source: https://store.arduino.cc/usa/arduino-micro
var MICRO_PWM_PINS = [3, 5, 6, 9, 10, 11, 13];
var ledsReady      = false;
var useLeds        = true; // For debugging, set to false if board is not plugged in
const THUMB_LED    = 11,
      INDEX_LED    = 10
      MIDDLE_LED   = 9,
      RING_LED     = 6;


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

    socket.on('thumb enter', function() {
        console.log('Thumb is hovering over line');
//        if (thumbLed) {
//            thumbLed.on();
//        }
        if (ledsReady) {
            board.analogWrite(THUMB_LED, 255);
        }
    });

    socket.on('thumb leave', function() {
        console.log("Thumb left");
//        if (thumbLed) {
//            thumbLed.brightness(30);
//            thumbLed.off();
//        }
        if (ledsReady) {
            board.analogWrite(THUMB_LED, 0);
        }

    });

    socket.on('index enter', function() {
        console.log('Index is hovering over line');
        if (ledsReady) {
            board.analogWrite(INDEX_LED, 255);
        }
    });

    socket.on('index leave', function() {
        console.log("Index left");
        if (ledsReady) {
            board.analogWrite(INDEX_LED, 0);
        }
    });

    socket.on('middle enter', function() {
        console.log('middle is hovering over line');
        if (ledsReady) {
            board.analogWrite(MIDDLE_LED, 255);
        }
    });

    socket.on('middle leave', function() {
        console.log("middle left");
        if (ledsReady) {
            board.analogWrite(MIDDLE_LED, 0);
        }
    });

    socket.on('ring enter', function() {
        console.log('ring is hovering over line');
        if (ledsReady) {
           board.analogWrite(RING_LED, 255);
        }
    });

    socket.on('ring leave', function() {
        console.log("ring left");
        if (ledsReady) {
            board.analogWrite(RING_LED, 0);
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

if (useLeds){
    // @ERICA CHANGE PORT DOWN HERE
    var port = new SerialPort("/dev/ttyS11", {baudRate: 9600});
    var board = new five.Board({port: port});
    //    led, frame;

    // Will need to address Windows/OSX/Linux ports https://github.com/rwaldron/johnny-five/wiki/Board
    board.on('ready', function() {
        this.pinMode(THUMB_LED, five.Pin.PWM);
        this.pinMode(INDEX_LED, five.Pin.PWM);
        this.pinMode(MIDDLE_LED, five.Pin.PWM);
        this.pinMode(RING_LED, five.Pin.PWM);
        ledsReady = true;
    //    thumbLed = new five.Led(THUMB_LED);
    //    indexLed = new five.Led(INDEX_LED);
    //    middleLed = new five.Led(MIDDLE_LED);
    //    ringLed = new five.Led(RING_LED);
    });
}

http.listen(3000, function() {
    console.log("listening on *:3000");
});
