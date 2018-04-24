// Import Famo.us dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;
//var ImageSurface = famous.surfaces.ImageSurface;
var StateModifier = famous.modifiers.StateModifier;
//var Draggable = famous.modifiers.Draggable;
//var GridLayout = famous.views.GridLayout;

var mainContext = Engine.createContext();

const CURSORSIZE = 10;
const LEAPSCALE = 0.6;
const YOFFSET = 400; // 400 pixels to bring the y coord down

// Turn Leap input into cursor on screen
var Cursor = Backbone.Model.extend({
  defaults: {
    screenPosition: [0, 0]
  },
  setScreenPosition: function(position) {
    this.set('screenPosition', position.slice(0));
  }
});

var cursor = new Cursor();

 // Draw the cursor
var cursorSurface = new Surface({
    size : [CURSORSIZE, CURSORSIZE],
    properties : {
        backgroundColor: 'black',
        borderRadius: CURSORSIZE/2 + 'px',
        pointerEvents : 'none',
        zIndex: 1
    }
});
var cursorOriginModifier = new StateModifier({origin: [0.5, 0.5]});
var cursorModifier = new Modifier({
    transform : function(){
      var cursorPosition = this.get('screenPosition');
      return Transform.translate(cursorPosition[0], cursorPosition[1], 0);
    }.bind(cursor)
});
mainContext.add(cursorOriginModifier).add(cursorModifier).add(cursorSurface);


// Called every time the Leap provides a new frame of data
Leap.loop({ hand: function(hand) {
    // Use the hand data to control the cursor's screen position
    var coords = hand.screenPosition(); 

    var cursorPosition = [coords[0], coords[1] + YOFFSET];
    cursor.setScreenPosition(cursorPosition);

    // PLAYING or END GAME so draw the board and ships (if player's board)
    // Note: Don't have to touch this code
    var point = func.eval({x:coords[0]});
    //var limits = getLimits();

    var width = $("#plot").width(), 
        height = $("#plot").height();
//    console.log($("rect"));
    var frame = hand.frame;
    //Get a pointable and normalize the tip position
    var pointable = frame.pointables[0];
    var interactionBox = frame.interactionBox;
    var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
    
    //Convert the normalized coordinates to span the canvas
    var canvasX = width * normalizedPosition[0];
    var canvasY = height * (normalizedPosition[1]);
    //console.log(cursorPosition, canvasX, canvasY);
}}).use('screenPosition', {scale: LEAPSCALE});


/**
    leap_range = leap_end - leap_start
    app_range = app_end - app_start
    x_app = (x_leap - leap_start)*app_range/leap_range  + app_start

*/

