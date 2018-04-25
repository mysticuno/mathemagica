
ws = new webSocket('ws://127.0.0.1:6437'),
five = require('johnny-five'),
board = new five.Board(),
led, frame;

board.on('ready', function() {
    led = new five.Led(13);    
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data); 
        funcPlot.on('plotly_hover', function(data){

            hoverInfo.innerHTML = 'hovering';
            led.on();
        })
        .on('plotly_unhover', function(data){
            hoverInfo.innerHTML = 'not hovering';
            led.off();
        });
    });
});