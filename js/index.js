var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame;

board.on('ready', function() {
    led = new five.Led(13);    
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data); 
        if (frame.hands && frame.hands.length > 1) {
            led.on();
            console.log("1");
        }
        else {
            led.off();
            console.log("0")
        }
    });
});