var socket = io();
var chart;
var p;

const CLIP_Y_OFFSET = 9;   // To hide the SVG lines at the top of the graph
const CLIP_HEIGHT   = 542; // To hide the SVG lines at the bottom of the graph
const VIB_THRESHOLD = 1;   // Number of y-axis ticks past which to set PWM to 0
const PWM_MAX       = 255; // Max value of PWM signal

/*
  getPWM: Gets the PWM value (0-255) to return based on how far away the current
    point is from where it should be.
    canvasX: The actual x-coordinate of the point in question
    canvasY: The actual y-coordinate of the point in question
    yScale: The D3 object that represents the y-axis. This is used to calculate the
      relative distance between the canvasY and what the expected y-coordiante
      should be, which helps in computing the PWM value.
    expr: expression from Math.js that represents the function being plotted. Will
      determine what the expected y-value for the given x-value should be.

  Returns: int (0-255) corresponding to strength of PWM signal to be sent
*/
function getPWM(canvasX, canvasY, yScale, expr) {
  let expectedY = expr.eval({x: canvasX});
  let actual_diff = Math.abs(expectedY - canvasY);
  let threshold = Math.abs(yScale.ticks()[1] - yScale.ticks()[0]) * VIB_THRESHOLD; 
  
  // Normalize such that the closer to the expected y-value, the stronger (closer
  // to 1) the signal will be
  let norm = 1 - Math.abs(canvasY - expectedY)/Math.abs(threshold - expectedY);
  let pwm = Math.max(norm * PWM_MAX, 0);

  return pwm;
}

/*
  Function that handles the logic for creating the D3 plot and graphing the function.
  Uses the function-plot.js library.
*/
function plot() {
  // compile the math expression once
  var expression = document.getElementById('eq').value;
  var expr = math.compile(expression);
  
  // evaluate the expression repeatedly for different values of x
  var xValues = math.range(-10, 10, 0.1).toArray();
  var yValues = xValues.map(function (x) {
    return expr.eval({x: x}); 
  });

  var xMin = math.round(math.min(xValues));
  var xMax = math.round(math.max(xValues));

  var yMin = math.round(math.min(yValues));
  var yMax = math.round(math.max(yValues));

  
  // var oldXMin = math.round(math.min(xValues));
  // var oldXMax = math.round(math.max(xValues));

  // var oldYMin = math.round(math.min(yValues));
  // var oldYMax = math.round(math.max(yValues));

  // var xMin = math.min(oldXMax, oldXMin);
  // var xMax = math.max(oldXMax, oldXMin);
  // var yMin = math.min(oldYMin, oldYMax);
  // var yMax = math.max(oldYMin, oldYMax);

  const OFFSET = (yMax-yMin)/10; // to deal with the SVG mask
  var coords = [0,0];

  p = functionPlot({
    target: '#plot',
    width: 1700,
    height: 600,
    xAxis: {
      domain: [xMin, xMax]
    },
    yAxis: {
      domain: [yMin-OFFSET, yMax+OFFSET]
    },
    grid: true,
    data: [{
      fn: expression,
      graphType: 'polyline',
      attr: {
        'stroke-width': '20px'
      },
      skipTip: true,
    }]
  });

  var canvasX = p.meta.xScale.invert;
  var canvasY = p.meta.yScale.invert;

  // Configure the mask to not cover the edges of the graph
  d3.select('.clip')
    .attr('y', CLIP_Y_OFFSET)
    .attr('height', CLIP_HEIGHT);

  // Have hovers go through canvas to line
  d3.select('.zoom-and-drag')
    .attr('style', 'fill: none; pointer-events:none');

  /*
    Event listeners for the custom enter events fired by the divs 
    representing the fingers
  */
  d3.select('.canvas')
    // Depending on the glove setup, thumb might not be used
    /*.on('thumbenter', function(elm) {
      var coords = d3.event.detail.coords;

       // Get top and left offset for canvas
      let offset = $('.zoom-and-drag').offset();
      let x = canvasX(coords[1]-offset.left);
      let y = canvasY(coords[0]-offset.top);
      let pwm = getPWM(x, y, p.meta.yScale, expr);
      socket.emit('thumb enter', pwm);
    }) */
    .on('indexenter', function(elm) {
      var coords = d3.event.detail.coords;
      let offset = $('.zoom-and-drag').offset();
      let x = canvasX(coords[1]-offset.left);
      let y = canvasY(coords[0]-offset.top);
      let pwm = getPWM(x, y, p.meta.yScale, expr);
      socket.emit('index enter', pwm);
    }) 
    .on('middleenter', function(elm) {
      var coords = d3.event.detail.coords;
      let offset = $('.zoom-and-drag').offset();
      let x = canvasX(coords[1]-offset.left);
      let y = canvasY(coords[0]-offset.top);
      let pwm = getPWM(x, y, p.meta.yScale, expr);
      socket.emit('middle enter', pwm);
    }) 
    .on('ringenter', function(elm) {
      var coords = d3.event.detail.coords;
      let offset = $('.zoom-and-drag').offset();
      let x = canvasX(coords[1]-offset.left);
      let y = canvasY(coords[0]-offset.top);
      let pwm = getPWM(x, y, p.meta.yScale, expr);
      socket.emit('ring enter', pwm);
    }) 
    .on('pinkyenter', function(elm) {
      var coords = d3.event.detail.coords;
      let offset = $('.zoom-and-drag').offset();
      let x = canvasX(coords[1]-offset.left);
      let y = canvasY(coords[0]-offset.top);
      let pwm = getPWM(x, y, p.meta.yScale, expr);
      socket.emit('pinky enter', pwm)
    });

  // Add event listeners to main line
  d3.select('.line')
    .attr("pointer-events", "stroke") // visiblePainted, visibleStroke, painted
    .on('mouseenter', function() { // Should match event fired by LeapCursor.js
      hoverInfo.innerHTML = 'Hovering!';
    })
    .on('mouseleave', function() { // Should match event fired by LeapCursor.js
      hoverInfo.innerHTML = 'Not hovering...';
    })
    /*.on('thumbenter', function() {
      hoverInfo.innerHTML = 'Thumb';
      socket.emit('thumb enter', PWM_MAX);
    })
    .on('thumbleave', function() {
      hoverInfo.innerHTML = 'Not hovering...';
      socket.emit('thumb leave');
    }) */
    .on('indexenter', function() {
      hoverInfo.innerHTML = 'Index';
      socket.emit('index enter', PWM_MAX);
    })
    .on('indexleave', function() {
      hoverInfo.innerHTML = 'Not hovering...';
      socket.emit('index leave');
    })
    .on('middleenter', function() {
      hoverInfo.innerHTML = 'Middle';
      socket.emit('middle enter', PWM_MAX);
    })
    .on('middleleave', function() {
      hoverInfo.innerHTML = 'Not hovering...';
      socket.emit('middle leave');
    }) 
    .on('ringenter', function() {
      hoverInfo.innerHTML = 'Ring';
      socket.emit('ring enter', PWM_MAX);
    })
    .on('ringleave', function() {
      hoverInfo.innerHTML = 'Not hovering...';
      socket.emit('ring leave');
    })
    .on('pinkyenter', function() {
      hoverInfo.innerHTML = 'Pinky';
      socket.emit('pinky enter', 255);
    })
    .on('pinkyleave', function() {
      hoverInfo.innerHTML = 'Not hovering...';
      socket.emit('pinky leave');
    });
}

// Get the expression from the form
document.getElementById('form').onsubmit = function (event) {
  event.preventDefault();
  plot();
};

plot();

// When the Leap not longer sees a hand, turn motors off
document.body.addEventListener('motorsoff', function() {
  socket.emit('motorsoff');
});
