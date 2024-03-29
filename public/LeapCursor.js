/*
    Code for using LeapMotion as a cursor. 
    Special thanks to https://github.com/roboleary/LeapCursor.js
    Modified to accommodate using multiple cursors for each of the fingers
    for Mathemagica.
*/

var LeapCursor = function(options) { this.initialize(options || {}); };

/**
 * 
 */
LeapCursor.prototype = {
    
    canvas              : null,
    controller          : null,
    trainer             : null,
    trainerEnabled      : false,
    evtController       : null,
    highlightedElm      : null,
    thumbHighlightedElm : null,
    indexHighlightedElm : null,
    middleHighlightedElm: null,
    ringHighlightedElm  : null,
    pinkyHighlightedElm : null,
    
    target              : window,
    
    width               : 110,
    height              : 110,
    
    top                 : null,
    left                : null,

    defaultHandPosition : false,
    
    gestureColor        : '#88CFEB',
    color               : '#000000',
    
    yOffset             : -160,

    palms               : null,
    fingers             : null,

    renderer            : null,
            
    material            : null,
    recordingMaterial   : null,
    palmGeometry        : null,
    fingerGeometry      : null,
    shadowPlane         : null,
    
    camera              : null,
    light               : null,
    scene               : null,
    
    lastFrame           : null,
    speed               : [0, 0, 0],
    dampening           : 0.95,
    scrollSpeed         : 0.1,

    pinky               : null,
    ring                : null,
    middle              : null,
    index               : null,
    thumb               : null,
    fingerWidth         : 20,
    fingerHeight        : 20,
    fingerBorderRadius  : 10,

    /**
     *
     * @param options
     */
    initialize: function(options) {

        /*
         * First, all passed options are set 
         */
        for (var optionName in options) { if (options.hasOwnProperty(optionName)) { this[optionName] = options[optionName]; }}

        if (options.controller) {
            
            this.trainerEnabled     = options.controller.controller != null;

        } else {

            this.trainerEnabled     = typeof LeapTrainer == 'object';
            this.controller         = this.trainerEnabled ? new LeapTrainer.Controller({pauseOnWindowBlur: false}) : new Leap.Controller();         
        }

        this.evtController = (this.trainerEnabled ? this.controller.controller : this.controller);

        /*
         * The cursor is created when the Leap connects - so if there is no device present, nothing happens.
         */
        this.evtController.on('connect', function() { this.createCursor(options); }.bind(this));

        if (!this.trainerEnabled) { this.controller.connect(); } else { this.trainer = this.controller; this.initDefaultGestures(); }       
    },
    
    /**
     * 
     */
    initDefaultGestures: function() {

        this.trainer.fromJSON('{"name":"TAP","data":[[{"x":0.03185018841689369,"y":-0.2955364919879749,"z":0.30395151229974915,"stroke":1},{"x":0.007577409512100508,"y":-0.143194645412326,"z":0.19583884160435477,"stroke":1},{"x":-0.01669536939269267,"y":0.009147201163322904,"z":0.08772617090896045,"stroke":1},{"x":-0.04096814829748574,"y":0.16148904773897182,"z":-0.020386499786433865,"stroke":1},{"x":-0.06524092720227892,"y":0.31383089431462075,"z":-0.12849917048182818,"stroke":1},{"x":0.07782081571377697,"y":0.22476552136320582,"z":-0.1333397144261559,"stroke":1},{"x":0.23307373058642433,"y":0.11811240326038724,"z":-0.13065635809070106,"stroke":1},{"x":0.3883266454590718,"y":0.011459285157568666,"z":-0.1279730017552462,"stroke":1},{"x":0.4352681776798024,"y":-0.0009652123270492141,"z":-0.12706884891425413,"stroke":1},{"x":0.3081486887178203,"y":0.13803971088137734,"z":-0.12902395213255644,"stroke":1},{"x":0.17468263510031368,"y":0.17148676740131702,"z":-0.10384411619161024,"stroke":1},{"x":0.03273981198368481,"y":0.06394578498928477,"z":-0.04242158249047845,"stroke":1},{"x":-0.10920301113294412,"y":-0.04359519742274748,"z":0.019000951210653316,"stroke":1},{"x":-0.25114583424957293,"y":-0.15113617983477973,"z":0.08042348491178514,"stroke":1},{"x":-0.39308865736620174,"y":-0.2586771622468122,"z":0.1418460186129169,"stroke":1},{"x":-0.3676876892078774,"y":-0.2980322196198223,"z":0.18794861619097114,"stroke":1},{"x":-0.1837044150586537,"y":-0.2727713079961436,"z":0.2195333713111643,"stroke":1},{"x":0.0002788590905699051,"y":-0.24751039637246458,"z":0.25111812643135767,"stroke":1},{"x":-0.010260994114239419,"y":-0.09918735642352758,"z":0.15251566678561213,"stroke":1},{"x":-0.030960057779212846,"y":0.05556275509441916,"z":0.0471140191357452,"stroke":1},{"x":-0.05165912144418616,"y":0.21031286661236592,"z":-0.0582876285141217,"stroke":1},{"x":-0.025351960830330755,"y":0.2967565986430546,"z":-0.13573927637868743,"stroke":1},{"x":0.13185969510169626,"y":0.1929784553588551,"z":-0.1353548361044802,"stroke":1},{"x":0.28907135103372306,"y":0.08920031207465556,"z":-0.13497039583027298,"stroke":1},{"x":-0.5647318223201976,"y":-0.24648143440976086,"z":-0.2794513983064423,"stroke":1}]]}');

        this.trainer.on('TAP', function() { this.fire('click'); }.bind(this));
    },

    createFingerDivs: function() {

        this.thumb     = document.createElement('div');
        this.thumb.style.position  = 'fixed';
        this.thumb.style.width     = this.fingerWidth  + 'px';
        this.thumb.style.height    = this.fingerHeight + 'px';
        this.thumb.style.zIndex    = 999999999;
        this.thumb.style.background = 'brown';
        this.thumb.style.borderRadius = this.fingerBorderRadius + 'px';
        this.thumb.setAttribute("id", "thumb");
        document.body.appendChild(this.thumb);

        this.index     = document.createElement('div');
        this.index.style.position  = 'fixed';
        this.index.style.width     = this.fingerWidth  + 'px';
        this.index.style.height    = this.fingerHeight + 'px';
        this.index.style.zIndex    = 999999999;
        this.index.style.background = 'brown';
        this.index.style.borderRadius = this.fingerBorderRadius + 'px';
        this.index.setAttribute("id", "index");
        document.body.appendChild(this.index);
        
        this.middle     = document.createElement('div');
        this.middle.style.position  = 'fixed';
        this.middle.style.width     = this.fingerWidth  + 'px';
        this.middle.style.height    = this.fingerHeight + 'px';
        this.middle.style.zIndex    = 999999999;
        this.middle.style.background = 'brown';
        this.middle.style.borderRadius = this.fingerBorderRadius + 'px';
        this.middle.setAttribute("id", "middle");
        document.body.appendChild(this.middle);
        
        this.ring     = document.createElement('div');
        this.ring.style.position  = 'fixed';
        this.ring.style.width     = this.fingerWidth  + 'px';
        this.ring.style.height    = this.fingerHeight + 'px';
        this.ring.style.zIndex    = 999999999;
        this.ring.style.background = 'brown';
        this.ring.style.borderRadius = this.fingerBorderRadius + 'px';
        this.ring.setAttribute("id", "ring");
        document.body.appendChild(this.ring);
        
        this.pinky     = document.createElement('div');
        this.pinky.style.position  = 'fixed';
        this.pinky.style.width     = this.fingerWidth  + 'px';
        this.pinky.style.height    = this.fingerHeight + 'px';
        this.pinky.style.zIndex    = 999999999;
        this.pinky.style.background = 'brown';
        this.pinky.style.borderRadius = this.fingerBorderRadius + 'px';
        this.pinky.setAttribute("id", "pinky");
        document.body.appendChild(this.pinky);
        
    },

    /**
     *
     * @param options
     */
    createCursor: function() {

        /*
         * We create a canvas element and append it to the document body - unless a canvas has been passed in the options
         */
        if (this.canvas == null) {

            this.canvas     = document.createElement('div');
            this.canvas.style.position  = 'fixed';

            this.canvas.style.width     = this.width  + 'px';
            this.canvas.style.height    = this.height + 'px';

            this.canvas.style.zIndex    = 999999999;

            document.body.appendChild(this.canvas);         
            this.createFingerDivs()
        }

        /*
         * If WebGL is unsupported we switch to a canvas renderer
         */
        this.renderer           = Detector.webgl ? new THREE.WebGLRenderer({antialias:true}) : new THREE.CanvasRenderer();
                
        this.renderer.setSize(this.width, this.height);

        this.renderer.shadowMapEnabled = true;      

        this.material           = new THREE.MeshBasicMaterial({color: this.color });
        this.recordingMaterial  = new THREE.MeshBasicMaterial({color: this.gestureColor });
        
        this.palmGeometry       = new THREE.CubeGeometry(60, 10, 60);
        this.fingerGeometry     = Detector.webgl ? new THREE.SphereGeometry(5, 20, 10) : new THREE.TorusGeometry(1, 5, 5, 5);

        this.scene              = new THREE.Scene();

        /*
         * A spotlight casts a shadow of the hand onto a transparent plane behind
         */
        this.light    = new THREE.SpotLight();
        
        this.light.castShadow = true;

        this.scene.add(this.light);
        
        /*
         * The camera is created and set to its initial position
         */
        this.camera = new THREE.PerspectiveCamera(45, 1, 1, 3000);

        /*
         * The renderer is added to the rendering area in the DOM.
         */
        this.canvas.appendChild(this.renderer.domElement);
        
        /*
         * An inital pair of palm meshs and ten this.fingers are added to the scene. The second palm and second five this.fingers 
         * are initially invisible.  The first palm and this.fingers are set in a default pose below.
         * 
         * NOTE: Currently only one hand is supported.
         */
        this.palms = [this.createPalm(), this.createPalm()];

        this.palms[1].visible = false;

        this.scene.add(this.palms[0]);
        this.scene.add(this.palms[1]);

        var finger; 
        
        this.fingers = [];
        
        for (var j = 0; j < 10; j++) { 

            finger = this.createFinger();
            
            finger.visible = j < 5;
            
            this.scene.add(finger);

            this.fingers.push(finger); // Finger meshes are stored for animation below
        }

        /*
         * 
         */
        this.createShadowPlane();

        /*
         * We set default a default pose for the one visible (right) hand
         */
        this.setDefaultPosition();
        this.fireOffEvent();

        /*
         * A window resize listener ensures the canvas default position remains correct relative to a changing window size. 
         */
        if (window.addEventListener) { window.addEventListener('resize', this.setDefaultPosition.bind(this), false); 

        } else if (elem.attachEvent) { window.attachEvent("onResize", this.setDefaultPosition.bind(this)); }        
        
        /*
         * If a trainer is available we set the gesture material to be used during recording.
         */
        if (this.trainerEnabled) {

            this.controller.on('started-recording', function () { this.setHandMaterial(this.recordingMaterial); }.bind(this))
                           .on('stopped-recording', function () { this.setHandMaterial(this.material); }.bind(this));
        }

        /*
         * We use Paul Irish's requestAnimFrame function (which is described 
         * here: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/) for 
         * updating the scene.
         *  
         */
        window.requestAnimFrame = (function(){
              return  window.requestAnimationFrame       ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame    ||
                      function(callback){ window.setTimeout(callback, 1000 / 60); };
            })();
        
        requestAnimFrame(this.updateRender.bind(this));

        /*
         * In order to avoid as much variable creation as possible during animation, variables are created here once.
         */
        var hand, palm, handFingers, handFingerCount, finger, handCount, elm;/*palmCount = this.palms.length*/; 
        var thumbelm, indexelm, middleelm, ringelm, pinkyelm;
        /*
         * Now we set up a Leap controller frame listener in order to animate the scene
         */
        var clock = new THREE.Clock();
        
        clock.previousTime = 1000000;   

        this.evtController.on('frame', function(frame) {

            if (clock.previousTime === 1000000) {

//                this.scroll(frame);

                handCount = frame.hands.length;
                
                if (handCount > 0) {

                    /*
                     * First we find the location of the actual hand
                     */
                    hand = frame.hands[0];

                    /*
                     * Get the positions of the fingers
                     */
                    var thumbFinger = hand.thumb,
                        indexFinger = hand.indexFinger,
                        middleFinger = hand.middleFinger,
                        ringFinger = hand.ringFinger,
                        pinkyFinger = hand.pinky;

                    var thumbTop     = (-thumbFinger.stabilizedTipPosition[1] * 3) + (window.innerHeight);
                    var thumbLeft    = (thumbFinger.stabilizedTipPosition[0] * 3) + (window.innerWidth/2);
                    this.thumb.style.top = thumbTop + 'px';
                    this.thumb.style.left = thumbLeft + 'px';
                    this.thumb.style.display = 'none';
                    
                    thumbelm = document.elementFromPoint(thumbLeft + this.fingerWidth/2, thumbTop + this.fingerHeight/2);
                    
                    this.thumb.style.display = 'block';

                  //  if (thumbelm != this.thumbHighlightedElm) {                        
                        this.fire('thumbleave', 'thumb', [thumbTop + this.fingerHeight/2, thumbLeft + this.fingerWidth/2]);    
                        this.thumbHighlightedElm = thumbelm;
                        this.fire('thumbenter', 'thumb', [thumbTop + this.fingerHeight/2, thumbLeft + this.fingerWidth/2]);
                   // }
                    // TODO: Add the events for the other fingers

                    var indexTop     = (-indexFinger.stabilizedTipPosition[1] * 3) + (window.innerHeight);
                    var indexLeft    = (indexFinger.stabilizedTipPosition[0] * 3) + (window.innerWidth/2);
                    this.index.style.top = indexTop + 'px';
                    this.index.style.left = indexLeft + 'px';
                    this.index.style.display = 'none';
                    
                    indexelm = document.elementFromPoint(indexLeft + this.fingerWidth/2, indexTop + this.fingerHeight/2);
                    
                    this.index.style.display = 'block';

                    // if (indexelm != this.indexHighlightedElm) {                        
                        this.fire('indexleave', 'index', [indexTop + this.fingerHeight/2, indexLeft + this.fingerHeight/2]);    
                        this.indexHighlightedElm = indexelm;
                        this.fire('indexenter', 'index', [indexTop + this.fingerHeight/2, indexLeft + this.fingerHeight/2]);
                    // }

                    var middleTop     = (-middleFinger.stabilizedTipPosition[1] * 3) + (window.innerHeight);
                    var middleLeft    = (middleFinger.stabilizedTipPosition[0] * 3) + (window.innerWidth/2);
                    this.middle.style.top = middleTop + 'px';
                    this.middle.style.left = middleLeft + 'px';
                    this.middle.style.display = 'none';
                    
                    middleelm = document.elementFromPoint(middleLeft + this.fingerWidth/2, middleTop + this.fingerHeight/2);
                    
                    this.middle.style.display = 'block';

                    // if (middleelm != this.middleHighlightedElm) {                        
                        this.fire('middleleave', 'middle', [middleTop + this.fingerWidth/2, middleLeft + this.fingerWidth/2]);
                        this.middleHighlightedElm = middleelm;
                        this.fire('middleenter', 'middle', [middleTop + this.fingerWidth/2, middleLeft + this.fingerWidth/2]);
                    // }
                    var ringTop     = (-ringFinger.stabilizedTipPosition[1] * 3) + (window.innerHeight);
                    var ringLeft    = (ringFinger.stabilizedTipPosition[0] * 3) + (window.innerWidth/2);
                    this.ring.style.top = ringTop + 'px';
                    this.ring.style.left = ringLeft + 'px';
                    this.ring.style.display = 'none';
                    
                    ringelm = document.elementFromPoint(ringLeft + this.fingerWidth/2, ringTop + this.fingerHeight/2);
                    
                    this.ring.style.display = 'block';

                    // if (ringelm != this.ringHighlightedElm) {
                        this.fire('ringleave', 'ring', [ringTop + this.fingerWidth/2, ringLeft + this.fingerWidth/2]);    
                        this.ringHighlightedElm = ringelm;
                        this.fire('ringenter', 'ring', [ringTop + this.fingerWidth/2, ringLeft + this.fingerWidth/2]);
                    // }

                    var pinkyTop     = (-pinkyFinger.stabilizedTipPosition[1] * 3) + (window.innerHeight);
                    var pinkyLeft    = (pinkyFinger.stabilizedTipPosition[0] * 3) + (window.innerWidth/2);
                    this.pinky.style.top = pinkyTop + 'px';
                    this.pinky.style.left = pinkyLeft + 'px';
                    this.pinky.style.display = 'none';
                    
                    pinkyelm = document.elementFromPoint(pinkyLeft + this.fingerWidth/2, pinkyTop + this.fingerHeight/2);
                    
                    this.pinky.style.display = 'block';

                    // if (pinkyelm != this.pinkyHighlightedElm) {
                        this.fire('pinkyleave', 'pinky', [pinkyTop + this.fingerWidth/2, pinkyLeft + this.fingerWidth/2]);    
                        this.pinkyHighlightedElm = pinkyelm;
                        this.fire('pinkyenter', 'pinky', [pinkyTop + this.fingerWidth/2, pinkyLeft + this.fingerWidth/2]);
                    // }

                    var top     = (-hand.stabilizedPalmPosition[1] * 3) + (window.innerHeight);
                    var left    = (hand.stabilizedPalmPosition[0] * 3) + (window.innerWidth/2);

                    /*
                     * Then we move the virtual hand to that position
                     */                 
                    this.canvas.style.top = top + 'px';
                    this.canvas.style.left = left + 'px';

                    /*
                     * Then we highlight the element at that location on the page
                     */
                    this.canvas.style.display = 'none';
                    
                    // maybe remove? TODO
                    elm = document.elementFromPoint(left + this.width/2, top + this.height/2);
                    
                    this.canvas.style.display = 'block';

                    if (elm != this.highlightedElm) {
                        
                        this.fire('mouseleave', null, [top, left] );
                        
                        this.highlightedElm = elm;
                        
                        this.fire('mouseenter', null, [top, left] );
                    }

                } else {
                    
                    if (!this.defaultHandPosition) { 
                        this.setDefaultPosition(); 
                        this.fireOffEvent();
                    }

                    return;
                }
                
                for (var i = 0; i < /*palmCount*/1; i++) { // NOTE: Currently we don't attempt to render the second hand
                    
                    palm = this.palms[i];

                    if (i >= handCount) {
                    
                        if (!this.defaultHandPosition) { // If the default pose is showing we don't update anything

                            palm.visible = false;

                            for (var j = 0, k = 5, p; j < k; j++) { p = (i * 5) + j; this.fingers[p].visible = false; };                        
                        }

                    } else {
                        
                        this.defaultHandPosition = false;
                        
                        hand = frame.hands[i];

                        this.positionPalm(hand, palm);
                        
                        palm.visible = true;

                        handFingers     = hand.fingers;
                        handFingerCount = handFingers.length;

                        /*
                         * 
                         */
                        for (var j = 0, k = 5; j < k; j++) {
                            
                            finger = this.fingers[(i * 5) + j];

                            if (j >= handFingerCount) {
                                
                                finger.visible = false;
                                
                            } else {

                                this.positionFinger(handFingers[j], finger, palm);
                                
                                finger.visible = true;
                            }
                        };
                    }
                }   
            }

        }.bind(this));      
    },
    
    /*
     * We bind a simple update function into the requestAnimFrame function
     */
    updateRender: function () { this.renderer.render(this.scene, this.camera); requestAnimFrame(this.updateRender.bind(this)); },
    
    /*
     * Creates a palm mesh
     */
    createPalm: function () { var palm = new THREE.Mesh(this.palmGeometry, this.material); palm.castShadow = true; palm.receiveShadow = true; return palm; },
    
    /*
     * Creates a finger mesh
     */
    createFinger: function () { var finger = new THREE.Mesh(this.fingerGeometry, this.material); finger.castShadow = true; finger.receiveShadow = true; return finger; },
    
    /*
     * Creates a transparent plane onto which hand shadows are cast.
     */
    createShadowPlane: function () { 
        
        /*
         * A shader is used to set the obscured areas to a shadow color, while leaving the rest of the plane transparent.
         */
        var planeFragmentShader = [

           "uniform vec3 diffuse;",
           "uniform float opacity;",

           THREE.ShaderChunk[ "color_pars_fragment" ],
           THREE.ShaderChunk[ "map_pars_fragment" ],
           THREE.ShaderChunk[ "lightmap_pars_fragment" ],
           THREE.ShaderChunk[ "envmap_pars_fragment" ],
           THREE.ShaderChunk[ "fog_pars_fragment" ],
           THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
           THREE.ShaderChunk[ "specularmap_pars_fragment" ],

           "void main() {",

               "gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

               THREE.ShaderChunk[ "map_fragment" ],
               THREE.ShaderChunk[ "alphatest_fragment" ],
               THREE.ShaderChunk[ "specularmap_fragment" ],
               THREE.ShaderChunk[ "lightmap_fragment" ],
               THREE.ShaderChunk[ "color_fragment" ],
               THREE.ShaderChunk[ "envmap_fragment" ],
               THREE.ShaderChunk[ "shadowmap_fragment" ],
               THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
               THREE.ShaderChunk[ "fog_fragment" ],

               "gl_FragColor = vec4( 0.0, 0.0, 0.0, min(0.1, 1.0 - shadowColor.x) );",

           "}"

       ].join("\n");

       var planeMaterial = new THREE.ShaderMaterial({
           uniforms         : THREE.ShaderLib['basic'].uniforms,
           vertexShader     : THREE.ShaderLib['basic'].vertexShader,
           fragmentShader   : planeFragmentShader,
           color: 0x0000FF
       });

       this.shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(this.width * 4, this.height * 4, 50), planeMaterial);

       this.shadowPlane.receiveShadow = true;
       
       this.scene.add(this.shadowPlane);
    },
    
    /*
     * This function returns the canvas, the palms, and the fingers to their original positions.
     */
    setDefaultPosition: function() {
        // Send PWM 0 event
        this.fire('motorsoff');

        this.canvas.style.top = ((this.top) ? this.top : window.innerHeight - this.height - 20) + 'px';
        this.canvas.style.left = ((this.left) ? this.left : window.innerWidth - this.width - 20) + 'px';        
        
        if (this.defaultHandPosition) { return; }
        
        this.defaultHandPosition = true;

        this.camera.position.set(0, 0, 350);
        this.shadowPlane.position.set(0, 0, -25);
        this.light.position.set(0, 0, 650);
        this.light.lookAt(this.shadowPlane);

        this.palms[0].position.set(25.62994, -37.67400000000001, 96.368);
        this.palms[0].rotation.set(-1.9921488149553125, 0.051271951412566935, -2.6597446090413466);

        this.fingers[0].position.set(64.179, 24.22, 28.7022);
        this.fingers[0].rotation.set(-2.677879785829599, 0.02183472660404244, 3.133282166633954);
        this.fingers[0].scale.z = 8;
        this.fingers[0].visible = true;
        
        this.fingers[1].position.set(83.8033, -15.913000000000011, 32.6661);
        this.fingers[1].rotation.set(-2.6753644328170965, 0.22532594370921782, 3.056111568660471);
        this.fingers[1].scale.z = 5;
        this.fingers[1].visible = true;
        
        this.fingers[2].position.set(34.69965, 49.19499999999999, 31.643);
        this.fingers[2].rotation.set(-2.500622653205929, 0.033504548426940645, 3.121471314695975);
        this.fingers[2].scale.z = 9;
        this.fingers[2].visible = true;

        this.fingers[3].position.set(8.7075, 50.976, 50.363);
        this.fingers[3].rotation.set(-2.443443897235925, 0.04106473211751575, 3.113625377842598);
        this.fingers[3].scale.z = 8;
        this.fingers[3].visible = true;
        
        this.fingers[4].position.set(-40.6532, -33.772999999999996, 84.7031);
        this.fingers[4].rotation.set(-2.489002343898949, -0.4631619960981157, -2.872745378807403);
        this.fingers[4].scale.z = 6;
        this.fingers[4].visible = true;
    },
    
    /*
     * Updates the material of the palm and this.fingers created above.  This function is called when recording starts and ends, in order to 
     * modify how visible hands look during recording.
     */
    setHandMaterial: function (m) {
        
        this.palms[0].material = m;
        this.palms[1].material = m;
        
        for (var i = 0, l = this.fingers.length; i < l; i++) { this.fingers[i].material = m; }      
    },
    
    /*
     * The palm is moved into position as determined by input from the Leap.  
     * 
     * The camera, shadow plane, and light are also moved. 
     * 
     * The positionPalm and positionFinger functions come from LeapTrainer, but are originally based on code 
     * from jestPlay (also under the MIT license), by Theo Armour:
     * 
     *  http://jaanga.github.io/gestification/cookbook/jest-play/r1/jest-play.html
     * 
     * Thanks Theo!
     */
    positionPalm: function (hand, palm) {

        var position = hand.stabilizedPalmPosition;

        palm.position.set(position[0], position[1] + this.yOffset, palm.position.z);    
        
        this.camera.position.x = this.shadowPlane.position.x = palm.position.x;
        this.camera.position.y = this.shadowPlane.position.y = palm.position.y;

        this.light.position.x = position[0];
        this.light.position.y = position[1];
        
        var direction = hand.direction;
        
        palm.lookAt(new THREE.Vector3(direction[0], direction[1], direction[2]).add(palm.position));

        var normal = hand.palmNormal;
        
        palm.rotation.z = Math.atan2(normal[0], normal[1]);
    },
    
    /*
     * 
     */
    positionFinger: function (handFinger, finger, palm) {

        var position = handFinger.stabilizedTipPosition;

        finger.position.set(position[0], position[1] + this.yOffset, position[2]);
        
        var direction = handFinger.direction;
        
        finger.lookAt(new THREE.Vector3(direction[0], direction[1], direction[2]).add(finger.position));

        finger.scale.z = 0.1 * handFinger.length;
    },
    
    /*
     * Updates the target scroll position 
     */
    scroll: function(frame) {

        if(!this.lastFrame) { this.lastFrame = frame; return; }
        
        var hands = frame.hands;

        if(hands.length == 0) {

            this.speed[0]  *= this.dampening;
            this.speed[1]  *= this.dampening;
            this.speed[2]  *= this.dampening;                   
            
            this.lastFrame = null; 

        } else if(hands.length == 1) {

            var velocity = frame.translation(this.lastFrame);

            this.speed[0] = this.scrollSpeed * velocity[0];
            this.speed[1] = this.scrollSpeed * velocity[1];
            this.speed[2] = this.scrollSpeed * velocity[2];
        }

        if (Math.abs(this.speed[0] + this.speed[1] + this.speed[2]) > 3) {

            var doc = document.documentElement, body = document.body;

            var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
            var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);      

            var target = this.target;
            
            if (target == window) {

                top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
                left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
            
            } else {
                
                top = target.scrollTop || 0;
                left = target.scrollLeft || 0;
            }

            target.scrollTo(left + this.speed[0], top - this.speed[1]);
        }
    },

    fire: function(evt, fingerType, coords) {
        // Short circuit to turn motors off when fingers leave canvas
        if (evt === 'motorsoff') {
            this.fireOffEvent(evt);
            return;
        }

        var elm;
        switch (fingerType) {
            case 'thumb':
                elm = this.thumbHighlightedElm;
                break;
            case 'index':
                elm = this.indexHighlightedElm;
                break;
            case 'middle':
                elm = this.middleHighlightedElm;
                break;
            case 'ring':
                elm = this.ringHighlightedElm;
                break;
            case 'pinky':
                elm = this.pinkyHighlightedElm;
                break;
            default:
                elm = this.highlightedElm;
        }

        
        if (!elm) { return; }
        
        var event;
        
        if (document.createEvent) {

//            event = document.createEvent("HTMLEvents");
//            event.initEvent(evt, true, true);
            event = new CustomEvent(evt, {
                detail: {
                    name: fingerType,
                    coords: coords
                }
            });
        
        } else {
            console.log('here');
            event = document.createEventObject();
            event.eventType = evt;
        }

        event.eventName = evt;
        
        if (event.initEvent) { event.initEvent(event.type, true, true); }

        if (document.createEvent) {

            elm.dispatchEvent(event);

        } else {

            elm.fireEvent('on' + event.eventType, event);
        }       
    },

    fireOffEvent: function(evt) {
        // First, move the elements representing fingers off the board
        this.index.style.top   = (window.innerHeight - this.height - 20) + 'px';
        this.index.style.left  = (window.innerWidth - this.width - 20) + 'px';   
        this.middle.style.top  = (window.innerHeight - this.height - 20) + 'px';
        this.middle.style.left = (window.innerWidth - this.width - 20) + 'px';   
        this.ring.style.top    = (window.innerHeight - this.height - 20) + 'px';
        this.ring.style.left   = (window.innerWidth - this.width - 20) + 'px';   
        this.pinky.style.top   = (window.innerHeight - this.height - 20) + 'px';
        this.pinky.style.left  = (window.innerWidth - this.width - 20) + 'px';  
        this.thumb.style.top   = (window.innerHeight - this.height - 20) + 'px';
        this.thumb.style.left  = (window.innerWidth - this.width - 20) + 'px';   

        var event;
        
        if (document.createEvent) {
            event = new CustomEvent(evt, {
                detail: {
                    name: 'motorsoff'
                }
            });
                
        } else {
            console.log('here');
            event = document.createEventObject();
            event.eventType = evt;
        }

        event.eventName = evt;
        
        if (event.initEvent) { event.initEvent(event.type, true, true); }

        if (document.createEvent) {
            // Hackily letting the canvas dispatch this event
            document.body.dispatchEvent(event);

        } else {

            document.body.fireEvent('on' + event.eventType, event);
        }       

    }
};

/**
 * Here we parse parameters to the script include in order to pass them as options to the LeapCursor constructor below.
 * 
 * @param query
 * @returns {Object}
 */
function parseQuery (query) {

    var parameters = new Object ();

    if (!query) return parameters; // return empty object

    var pairs = query.split(/[;&]/);

    for ( var i = 0; i < pairs.length; i++ ) {

        var KeyVal = pairs[i].split('=');

        if ( ! KeyVal || KeyVal.length != 2 ) continue;

        var key = unescape( KeyVal[0] );
        var val = unescape( KeyVal[1] );

        val = val.replace(/\+/g, ' ');

        parameters[key] = val;
    }

    return parameters;      
}

var scripts = document.getElementsByTagName('script');

var params = this.parseQuery(scripts[scripts.length - 1].src.replace(/^[^\?]+\??/,''));

/**
 * 
 */
if (window.addEventListener) { window.addEventListener('load', function() { window.leapCursor = new LeapCursor(params); }, false); 

} else if (elem.attachEvent) { window.attachEvent("onLoad", function() { window.leapCursor = new LeapCursor(params); }); }