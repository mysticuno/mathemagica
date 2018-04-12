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
    funcPlot = plotInfo[0];
    data = plotInfo[1];
    layout = plotInfo[2];
    draw(data, layout);
};

var funcPlot = plotInfo[0];
var data = plotInfo[1];
var layout = plotInfo[2];
draw(data, layout);

// var socket = io("http://localhost:8080");
// socket.connect('http://localhost:8080');
funcPlot.on('plotly_hover', function(data){

    hoverInfo.innerHTML = 'hovering';
    // led.on();
})
.on('plotly_unhover', function(data){
    hoverInfo.innerHTML = 'not hovering';
    // led.off();
});

// Leap.loop({ hand: function(hand) 
// var socket = io.connect(window.location.hostname + ':' + 8080);

