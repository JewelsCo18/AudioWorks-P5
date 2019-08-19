///////////////////////////////////////////////////////////////////////////////

//example options
var example = function(p) { 
	var smoothing = 0.8; // play with this, between 0 and .99
	var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 an 1024
	var particles =  new Array(binCount); 


	p.setup = function() {
		example_canvas = p.createCanvas(0, 0);
		example_canvas.position(0,50); 
		p.noStroke();

		selection = p.createSelect(); 
		selection.position(header_x,60); 
		selection.option("None"); 
		selection.option("Particle System");
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

	}

	p.draw = function(){
		p.background(110, 110, 110);

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
					//draw the particles
					particles[i].draw(); 
				}

				// update x position (in case we change the bin count while live coding)
				particles[i].position.x = map(i, 0, binCount, 0, width * 2);
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
		for (var i = 0; i < binCount; i++) {
			particles[i].color = [random(0, curr_stroke[0]), random(0,curr_stroke[1]), random(0,curr_stroke[2])];
		}
	}
}

function mySelectEvent() {
  var view = selection.value(); 
  if (view == "None") {
  	eliminateOptions();
  }
  else if (view == "Particle System") {
    particle_bool = true; 
  }
}

function eliminateOptions(){
	particle_bool = false; 
}










