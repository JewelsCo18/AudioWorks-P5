///////////////////////////////////////////////////////////////////////////////

//example options
var example = function(p) { 
	var smoothing = 0.8; // play with this, between 0 and .99
	var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 an 1024
	var particles =  new Array(binCount); 
	var offset_move_x = windowWidth/2;

	p.setup = function() {
		example_canvas = p.createCanvas(0, 0);
		example_canvas.position(0,50); 

		selection = p.createSelect(); 
		selection.position(header_x,60); 
		selection.option("Click here!"); 
		selection.option("Particle System");
		selection.option("Amplitude"); 
		selection.option("Correlation Circle");
		selection.changed(mySelectEvent); 
		selection.hide(); 

		// initialize the FFT, plug in our variables for smoothing and binCount
		particle_fft = new p5.FFT(smoothing, binCount);
		particle_fft.setInput(mic);

		// instantiate the particles.
		for (var i = 0; i < particles.length; i++) {
			var x = p.map(i, 0, binCount, 0, width * 2);
			var y = p.random(0, height);
			var position = p.createVector(x, y);
			particles[i] = new Particle(position);
		}

		//amplitude 
		amplitude = new p5.Amplitude();
		amplitude.setInput(mic);
		amplitude.smooth(0.6);
		rectMode(CENTER);

		//circle 

		// default mode is radians
		angleMode(RADIANS);
		translate(windowWidth/2, windowHeight/2);

		circle_fft = new p5.FFT();
		circle_fft.setInput(mic);

	}

	p.draw = function(){
		p.background(50, 50, 50);

		if (example_bool == true){

			//Particle Section
			// returns an array with [binCount] amplitude readings from lowest to highest frequencies
			var spectrum = particle_fft.analyze(binCount);

			// update and draw all [binCount] particles!
			// Each particle gets a level that corresponds to
			// the level at one bin of the FFT spectrum. 
			// This level is like amplitude, often called "energy."
			// It will be a number between 0-255.
			for (var i = 0; i < binCount; i++) {
				var thisLevel = p.map(spectrum[i], 0, 255, 0, 1);

				// update values based on amplitude at this part of the frequency spectrum
				particles[i].update( thisLevel );

				if (particle_bool == true){
					p.noStroke();
					//draw the particles
					particles[i].draw(); 
				}

				// update x position (in case we change the bin count while live coding)
				particles[i].position.x = map(i, 0, binCount, 0, width * 2);
			}

			if (amplitude_bool == true){
				 var level = amplitude.getLevel();

				// rectangle variables
				var spacing = 10;
				var w = width/ (prevLevels.length * spacing);

				var minHeight = 2;
				var roundness = 20;

				// add new level to end of array
				prevLevels.push(level);

				// remove first item in array
				prevLevels.splice(0, 1);

				// loop through all the previous levels
				for (var i = 0; i < prevLevels.length; i++) {
					print(i);

					var x = map(i, prevLevels.length, 0, width/2, width);
					var h = map(prevLevels[i], 0, 0.5, minHeight, height);

					//var alphaValue = logMap(i, 0, prevLevels.length, 1, 250);

					//var hueValue = p.map(h, minHeight, height, 200, 255);

					p.noStroke(); 

					p.fill(curr_stroke[0], curr_stroke[1], curr_stroke[2], 100);

					p.rect(x, height/2, w, h+25);
					p.rect(width - x, height/2, w, h+25);
				}
			}

			if (circle_bool == true){
  				p.stroke(curr_stroke[0], curr_stroke[1], curr_stroke[2], 100);
  				p.strokeWeight(2); 

				// min radius of ellipse
				p.noFill();
				var minRad = 2;

				// max radius of ellipse
				var maxRad = height;

				// array of values from -1 to 1
				var timeDomain = circle_fft.waveform(1024, 'float32');
				var corrBuff = autoCorrelate(timeDomain);

				var len = corrBuff.length;

				// draw a circular shape
				p.beginShape();

				for (var i = 0; i < len; i++) {
					var angle = map(i, 0, len, 0, HALF_PI);
					var offset = map(abs(corrBuff[i]), 0, 1, 0, maxRad) + minRad;
					var x = (offset) * cos(angle);
					var y = (offset) * sin(angle);
					p.curveVertex(x + offset_move_x, y+300);
				}

				for (var i = 0; i < len; i++) {
					var angle = map(i, 0, len, HALF_PI, PI);
					var offset = map(abs(corrBuff[len - i]), 0, 1, 0, maxRad) + minRad;
					var x = (offset) * cos(angle);
					var y = (offset) * sin(angle);
					p.curveVertex(x+offset_move_x, y+300);
				}

				// semi circle with mirrored
				for (var i = 0; i < len; i++) {
					var angle = map(i, 0, len, PI, HALF_PI + PI);
					var offset = map(abs(corrBuff[i]), 0, 1, 0, maxRad) + minRad;
					var x = (offset) * cos(angle);
					var y = (offset) * sin(angle);
					p.curveVertex(x+offset_move_x, y+300);
				}

				for (var i = 0; i < len; i++) {
					var angle = map(i, 0, len, HALF_PI + PI, TWO_PI);
					var offset = map(abs(corrBuff[len - i]), 0, 1, 0, maxRad) + minRad;
					var x = (offset) * cos(angle);
					var y = (offset) * sin(angle);
					p.curveVertex(x+offset_move_x, y+300);
				}


				p.endShape(CLOSE);

			}

		}
	}

	var Particle = function(position) {
	this.position = position;
	this.scale = random(0, 1);
	this.speed = p.createVector(0, random(0, 10) );
	this.color = [random(0, curr_stroke[0]), random(0,curr_stroke[1]), random(0,curr_stroke[2])];
	}

	var theyExpand = 1;

	// use FFT bin level to change speed and diameter
	Particle.prototype.update = function(someLevel) {
	  this.position.y += this.speed.y / (someLevel*2);
	  if (this.position.y > example_canvas.height) {
	    this.position.y = 0;
	  }
	  this.diameter = map(someLevel, 0, 1, 0, 100) * this.scale * theyExpand;

	}

	Particle.prototype.draw = function() {
	  p.fill(this.color);
	  p.ellipse(
	    this.position.x, this.position.y,
	    this.diameter, this.diameter
	  );
	}

	p.touchMoved = function(){
		if (particle_bool == true){
			for (var i = 0; i < binCount; i++) {
			particles[i].color = [random(0, curr_stroke[0]), random(0,curr_stroke[1]), random(0,curr_stroke[2])];
			}
		}
		if (amplitude_bool == true){
			p.fill(curr_stroke[0], curr_stroke[1], curr_stroke[2]); 
		}
		if (circle_bool == true){
			p.stroke(curr_stroke[0], curr_stroke[1], curr_stroke[2], 100);
		}
	}
}

function mySelectEvent() {
  var view = selection.value(); 
  if (view == "Particle System") {
  	eliminateOptions(); 
    particle_bool = true; 
  }
  else if (view == "Amplitude"){
  	eliminateOptions(); 
  	amplitude_bool = true; 
  }
  else if (view == "Correlation Circle"){
  	eliminateOptions(); 
  	circle_bool = true; 
  }
}

function eliminateOptions(){
	particle_bool = false; 
	amplitude_bool = false; 
	circle_bool = false; 
}

function autoCorrelate(buffer) {
  var newBuffer = [];
  var nSamples = buffer.length;

  var autocorrelation = [];

  // center clip removes any samples under 0.1
  if (centerClip) {
    var cutoff = centerClip;
    for (var i = 0; i < buffer.length; i++) {
      var val = buffer[i];
      buffer[i] = Math.abs(val) > cutoff ? val : 0;
    }
  }

  for (var lag = 0; lag < nSamples; lag++){
    var sum = 0; 
    for (var index = 0; index < nSamples; index++){
      var indexLagged = index+lag;
      var sound1 = buffer[index];
      var sound2 = buffer[indexLagged % nSamples];
      var product = sound1 * sound2;
      sum += product;
    }

    // average to a value between -1 and 1
    newBuffer[lag] = sum/nSamples;
  }

  if (bNormalize){
    var biggestVal = 0;
    for (var index = 0; index < nSamples; index++){
      if (abs(newBuffer[index]) > biggestVal){
        biggestVal = abs(newBuffer[index]);
      }
    }
    // dont divide by zero
    if (biggestVal !== 0) {
      for (var index = 0; index < nSamples; index++){
        newBuffer[index] /= biggestVal;
      }
    }
  }

  return newBuffer;
}










