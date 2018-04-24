function createPlot(){
        try {
    // compile the expression once
        var expression = document.getElementById('eq').value;
        var expr = math.compile(expression);

        // evaluate the expression repeatedly for different values of x
        var xValues = math.range(-10, 10, 0.1).toArray();
        var yValues = xValues.map(function (x) {
            return expr.eval({x: x});
        });

        // render the plot using plotly
      
        var plot = document.getElementById('plot')
        var data = [{x: xValues,
                    y: yValues,
                    type: 'scatter'
                    }]
        var layout = {hovermode:'closest',
                    hoverdistance: 25};

        return [plot, data, layout]
    }
    catch (err) {
        console.error(err);
        alert(err);
    }
    }
function draw(data, layout) {

    Plotly.newPlot('plot', data, layout);

}
var plotInfo = createPlot();


document.getElementById('form').onsubmit = function (event) {
    event.preventDefault();
    plotInfo = createPlot();
    funcPlot = plotInfo[0]
    data = plotInfo[1]
    layout = plotInfo[2]
    draw(data, layout);
};

var funcPlot = plotInfo[0]
var data = plotInfo[1]
var layout = plotInfo[2]
draw(data, layout);

// Make sure you have the leap motion service running otherwise you'll get an error
var webSocket = require('ws'),
ws = new webSocket('ws://127.0.0.1:6437'),
SerialPort = require("serialport"),
five = require('johnny-five'),
board = new five.Board(),
console.log(SerialPort);
//COM_PORT = new SerialPort("COM7", {baudrate: 9600, buffersize: 1}),
var port = new SerialPort("/dev/ttyS7", {baudRate: 9600});
var board = new five.Board({port: port}),
    led, frame;

// Will need to address Windows/OSX/Linux ports https://github.com/rwaldron/johnny-five/wiki/Board
SerialPort.list(function (err, ports) {
		console.log(ports);
});


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
