var mic, fft;
var divisions = 5;
var cnv;
var speed = 1;
var input; 
var button; 
var points; //for 3d spectrum and button 
var bassPoints = 3;
var midPoints = 3; 
var treblePoints = 12;
var top_zero = false; 

function setup() {
  cnv = createCanvas(windowWidth/1.2, windowHeight/2);
  cnv.position((windowWidth/6)+10,windowHeight/2); 

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);
}

////////////////////////////////////////////////////////////////////////////////

function draw() {
  noFill();

  var h = (height/divisions);
  var spectrum = fft.analyze();
  var newBuffer = [];
  stroke(rline_slide.value(),gline_slide.value(),bline_slide.value(),100);

  var scaledSpectrum = splitOctaves(spectrum, 12);
  var len = scaledSpectrum.length;

  background(r_slide.value(),g_slide.value(),b_slide.value(),1);
  // copy before clearing the background
  copy(cnv,0,0,width,height,0,speed,width,height);

  // draw shape
  beginShape();

    // one at the far corner
    curveVertex(0, h);

    for (var i = 0; i < len; i++) {
      var point = smoothPoint(scaledSpectrum, i, 2);
      var x = map(i, 0, len-1, 0, width);
      var y = map(point, 0, 255, h+150, 0);
      curveVertex(x, y);
    }
    curveVertex(width, h);
  endShape();
}

function splitOctaves(spectrum, slicesPerOctave) {
  
  fft.analyze(); 

  var scaledSpectrum = [];
  var len = spectrum.length;

  if (top_zero == false) {
    if (fft.getEnergy("treble") == true) {
      points = trebleslider.value();
    }

  else if (fft.getEnergy("bass") == true) {
      points = bassslider.value();
    }

  else {
      if (fft.getEnergy("lowMid") == true) {
        points = bassslider.value(); 
      }
      else if (fft.getEnergy("highMid") == true) {
        points = trebleslider.value(); 
      }
      else {
        points = midslider.value();
      }  
    }
  } 
  else{
    points = 0; 
  }


  //print("array", trebleslider.value(), bassslider.value(), midslider.value()); 
  //print(points);
  
  var nthRootOfTwo = Math.pow(2, 1/points);

  // the last N bins get their own 
  var lowestBin = slicesPerOctave;

  var binIndex = len - 1;
  var i = binIndex;


  while (i > lowestBin) {
    var nextBinIndex = round( binIndex/nthRootOfTwo );

    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins
    var energy = total/numBins;
    scaledSpectrum.push(energy);

    // keep the loop going
    binIndex = nextBinIndex;
  }

  // add the lowest bins at the end
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}


// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index+neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof(spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val/smoothedPoints;

  return val;
}

////////////////////////////////////////////////////////////////////////////////

var side_bar = function(p) { 
  var side_cnv; 

  p.setup = function() {
    side_cnv = p.createCanvas(windowWidth/6, windowHeight); 
    side_cnv.position(0,0);
    p.background(49,51,53, 100);
    p.noLoop();

    selection = createSelect(); 
    selection.position(10,95); 
    selection.option("Full View");
    selection.option("Top View"); 
    selection.option("Bottom View"); 
    selection.option("Empty View"); 
    selection.changed(mySelectEvent);  

    bassslider = createSlider(0,15,3); 
    bassslider.position(10, 200); 

    midslider = createSlider(0,15,3); 
    midslider.position(10, 220); 

    trebleslider = createSlider(0,15,12); 
    trebleslider.position(10, 240); 

    r_slide = createSlider(0, 255, 255); 
    r_slide.position(10, 340); 

    g_slide = createSlider(0,255, 255); 
    g_slide.position(10, 360); 

    b_slide = createSlider(0,255,255); 
    b_slide.position(10, 380); 

    //////////////

    rline_slide = createSlider(0, 255, 255); 
    rline_slide.position(10, 430); 

    gline_slide = createSlider(0,255, 119); 
    gline_slide.position(10, 450); 

    bline_slide = createSlider(0,255,0); 
    bline_slide.position(10, 470); 
  }

  p.draw = function() {
    p.fill(255,255,255); 
    p.textFont('Baskerville'); 

    //Headers
    p.textSize(36); 
    p.text('AudioWorks', 10,35);

    //Sub Headers
    p.textSize(24); 
    p.text("View Adjuster", 10, 70); 
    p.text("Frequency Adjuster", 10, 155); 
    p.text("Color Adjuster", 10, 300); 

    //General Text Size 
    p.textSize(14);

    //View Blurb
    p.text("Change which waveform runs below", 10, 87); 

    //Frequency Blurb
    p.text("Slide through values 0 to 15 to change", 10,175)
    p.text("input sensitivity for each frequency range!", 10, 190)
    
    //frequency slider descriptions
    p.text("Bass input", 150, 212); 
    p.text("Mid input", 150, 232);  
    p.text("Treble input", 150, 252);

    //colour picker description
    p.text("Change the line and background color", 10, 320); 

    //colour slider descriptions
    p.text("Background Color", 10, 340); 
    p.text("Red", 150, 354); 
    p.text("Green", 150, 374); 
    p.text("Blue", 150, 394); 

    p.text("Line Color", 10, 420); 
    p.text("Red", 150, 444); 
    p.text("Green", 150, 464); 
    p.text("Blue", 150, 484); 

  }

}

////////////////////////////////////////////////////////////////////////////////

var o_sketch = function(p) { 
  p.x = 100; 
  p.y = 100;  
  p.mic; 
  p.fft; 
  p.trigger;
  p.working = true; 
  var o_cnv; 

  p.setup = function() {
    o_cnv = p.createCanvas(windowWidth/1.2, windowHeight/2);
    o_cnv.position(250,0); 
    
    p.mic = new p5.AudioIn();
    p.fft = new p5.FFT(0.8, 2048);

    p.mic.start(); 
    p.fft.setInput(p.mic); 

  }
  p.draw = function() {

    p.text("Bass input",0,0);
    p.strokeWeight(2);
    p.noFill();
    p.stroke(rline_slide.value(),gline_slide.value(),bline_slide.value());
    p.background(r_slide.value(),g_slide.value(),b_slide.value());
    p.waveform = p.fft.waveform(); 
    p.beginShape();
    p.trigger = 0;

  for (i = 0; i < p.waveform.length; i++){
      if ((p.waveform[i] > 0) && (p.waveform[i-1] <= 0) && (p.trigger == 0))
      {
        p.trigger = 1;
        p.firstPos = i;
      }
      if (p.trigger == 1)
      {
        p.x = map((i - p.firstPos), 0, p.waveform.length, 0, p.width * 3);
        p.y = map(p.waveform[i], -1, 1, p.height, 0);
      }
      p.vertex(p.x, p.y);
    }
    p.endShape();

  }
}

////////////////////////////////////////////////////////////////////////////////
var side_bar = new p5(side_bar); 
var space = new p5(); 
var o_p5 = new p5(o_sketch);


function mySelectEvent() {
  var view = selection.value(); 
  if (view == "Full View") {
    top_zero = false; 
    mic.start(); 
    fft.setInput(mic); 
    o_p5.mic.start(); 
    o_p5.fft.setInput(o_p5.mic); 
  }
  else if (view == "Bottom View") {
    top_zero = false; 
    mic.start(); 
    fft.setInput(mic); 
    o_p5.mic.stop(); 
    o_p5.fft.setInput(o_p5.mic); 

  }
  else if (view == "Top View") {
    top_zero = true; 
    o_p5.mic.start(); 
    o_p5.fft.setInput(o_p5.mic); 

  }
  else if (view == "Empty View") {
    mic.stop(); 
    fft.setInput(mic); 
    o_p5.mic.stop(); 
    o_p5.fft.setInput(o_p5.mic); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth/1.2, windowHeight/2);
  cnv.position(250, windowHeight/2); 
  o_p5.resizeCanvas(windowWidth/1.2, windowHeight/2);
  background(255,255,255,1); 
  o_p5.background(0,0,0);
  o_cnv.position(250, windowHeight/2); 
}

