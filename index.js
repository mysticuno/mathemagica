// Make sure you have the leap motion service running otherwise you'll get an error
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var webSocket = require('ws');

// The port the Arduino is connected to, which can be found under
// 'Tools > Serial Port' in the Arduino IDE. If the port on the IDE
// is "COM5", then the corresponding WSL port is "/dev/ttyS5"
var COM_PORT = "/dev/ttyS5"; // or "COM5" if running not from bash on windows

// The websocket through which the Leap can talk to the system. Make sure that
// the Leap Service is running in the background to open this port
var LEAP_SOCKET = 'ws://127.0.0.1:6437';

// source: https://store.arduino.cc/usa/arduino-micro
var MICRO_PWM_PINS = [3, 5, 6, 9, 10, 11, 13];
var hardwareReady  = false;
var useHardware    = true; // For debugging, set to false if board is not plugged in

const INDEX_PIN    = 10
      MIDDLE_PIN   = 9,
      RING_PIN     = 6,
      PINKY_PIN    = 11;

app.use("/public", express.static(__dirname + "/public"));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    console.log("Serving " + __dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('connected to websocket');
    socket.on('disconnect', function() {
        console.log('websocket disconnected');
        if (hardwareReady) {
            // Zero all motors
            // board.analogWrite(THUMB_PIN, 0);
            board.analogWrite(INDEX_PIN, 0);
            board.analogWrite(MIDDLE_PIN, 0);
            board.analogWrite(RING_PIN, 0);
            board.analogWrite(PINKY_PIN, 0);
        }
    });

	// Currently, the setup uses all fingers except the thumb, but adding the
	// the thumb is a matter of uncommenting the appropriate lines
    socket.on('thumb enter', function(pwm) {
        if (hardwareReady) {
            // board.analogWrite(THUMB_PIN, pwm);
        }
    });

    socket.on('thumb leave', function() {
        if (hardwareReady) {
            // board.analogWrite(THUMB_PIN, 0);
        }

    });

    socket.on('index enter', function(pwm) {
        console.log('Index is hovering over line');
        if (hardwareReady) {
            board.analogWrite(INDEX_PIN, pwm);
        }
    });

    socket.on('index leave', function() {
        console.log("Index left");
        if (hardwareReady) {
            board.analogWrite(INDEX_PIN, 0);
        }
    });

    socket.on('middle enter', function(pwm) {
        console.log('middle is hovering over line');
        if (hardwareReady) {
            board.analogWrite(MIDDLE_PIN, pwm);
        }
    });

    socket.on('middle leave', function() {
        console.log("middle left");
        if (hardwareReady) {
            board.analogWrite(MIDDLE_PIN, 0);
        }
    });

    socket.on('ring enter', function(pwm) {
        console.log('ring is hovering over line');
        if (hardwareReady) {
           board.analogWrite(RING_PIN, pwm);
        }
    });

    socket.on('ring leave', function() {
        console.log("ring left");
        if (hardwareReady) {
            board.analogWrite(RING_PIN, 0);
        }
    });

    socket.on('pinky enter', function(pwm) {
        console.log('ring is hovering over line');
        if (hardwareReady) {
           board.analogWrite(PINKY_PIN, pwm);
        }
    });

    socket.on('pinky leave', function() {
        console.log("ring left");
        if (hardwareReady) {
            board.analogWrite(PINKY_PIN, 0);
        }
    });

    socket.on('motorsoff', function() {
        console.log('Hand left canvas, turning motors off');
        if (hardwareReady) {
            // Zero all motors
            // board.analogWrite(THUMB_PIN, 0);
            board.analogWrite(INDEX_PIN, 0);
            board.analogWrite(MIDDLE_PIN, 0);
            board.analogWrite(RING_PIN, 0);
            board.analogWrite(PINKY_PIN, 0);
        }
    });
});

// Needed to interface with leapmotion
var ws = new webSocket(LEAP_SOCKET),
    SerialPort = require("serialport"),
    five = require('johnny-five');

if (useHardware){
    // Depending on where on the computer the Arduino is plugged in, the port
    // might change. Check using the Arduino IDE
    var port = new SerialPort(COM_PORT, {baudRate: 9600});
    var board = new five.Board({port: port});

    // See https://github.com/rwaldron/johnny-five/wiki/Board for more information
	// about the Board API and ports

    board.on('ready', function() {
        this.pinMode(PINKY_PIN, five.Pin.PWM);
        this.pinMode(INDEX_PIN, five.Pin.PWM);
        this.pinMode(MIDDLE_PIN, five.Pin.PWM);
        this.pinMode(RING_PIN, five.Pin.PWM);
        hardwareReady = true;
    });
}

http.listen(3000, function() {
    console.log("listening on *:3000");
});
