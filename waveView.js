////////////////////////////////////////////////////////////////////////////////
// Isolated setup for Top Waveform
// Moved this closure to a separate file, waveView.js
////////////////////////////////////////////////////////////////////////////////


var o_sketch = function(p) { 
//	p.x = 100; 			// Not used
//	p.y = 100;			// Not used
//	p.fft;				// Not needed... only need one FFT object for all the views 
//	p.trigger;			// Not used
//	p.working = true; 	// Not used
	p.rightMargin = 75;	// Margin from right edge of canvas for interface elements
	p.topMargin = 45;	// Margin from top for interface elements
	p.buttonSize = 50;	// Size of zoom buttons
	p.buttonSpacing=25;	// Spacing between zoom indicators	
	var o_cnv;			// Canvas for this view
	p.wave = [];		// Array for storing / plotting sound wave
	p.fftBins = 1024;	// Default buffer size for p5.js FFT object
	p.maxScale = 6;		// Maximum wave plot scaling factor (power of 2, i.e., 2^6 = 64x)
	p.dot = false;
	p.drawWave = [];

/* The following are defined in master js file (FFT_Wave_CV.js)
	waveScale = 3;		// Initial wave plot scaling factor (power of 2, i.e., 2^3 = 8x)
						// NOTE: higher scale factor is zooming "out", lower is zooming "in"
	zoomButtonSize = 50;// Zoom button default dimensions
*/


	p.setup = function() {
//		o_cnv = p.createCanvas(980 - (139), 400);
		o_cnv = p.createCanvas(windowWidth - 200, 300);
		o_cnv.position(200,0); 
		p.loop(); 

		//    p.fft = new p5.FFT(0.8, 2048);

		//    p.fft.setInput(mic);

		p.o_zoom_in = createButton("+"); 
		p.o_zoom_in.position(windowWidth - p.rightMargin,20); 
		p.o_zoom_in.mousePressed(p.zoom_in);
		p.o_zoom_in.size(zoomButtonSize, zoomButtonSize); 

		p.o_zoom_out = createButton("-"); 
		p.o_zoom_out.position(windowWidth - p.rightMargin - (p.maxScale*p.buttonSpacing) - (zoomButtonSize+p.buttonSpacing),20); 
		p.o_zoom_out.mousePressed(p.zoom_out);
		p.o_zoom_out.size(zoomButtonSize, zoomButtonSize);

		// Create full length wave array and fill with zeros
		p.wave = new Array(1024 * Math.pow(2,p.maxScale) ).fill(0); 
	}

	p.draw = function() {
		if (pause_wave == 0) {
			p.strokeWeight(2);

			if (colour_bool == true) {
				p.stroke(rline_slide.value(),gline_slide.value(),bline_slide.value());
				p.background(red_slide.value(),green_slide.value(),blue_slide.value());
			}
			else{
				p.stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2]); 
				p.background(curr_background[0],curr_background[1],curr_background[2]); 
			}

	//      var wave = p.fft.waveform();	// not needed, use fft.waveform()
			p.wave = p.wave.concat(fft.waveform());
				// There's no guarantee that successive frames are contiguous (possible dropouts)
				// Probably want to fix this, at least for synthesis
			p.wave.splice(0,1024);
						
			if (synthesis_bool) {
				//p.scaleFactor = 0.5 / synthGainFudgeFactor;
				if (wavedraw_mode) {
					p.scaleFactor = wavedraw_scale;
				} else {
					p.scaleFactor = 1;
				}
			} else {
				p.scaleFactor = 1;
			}
				

			if (waveScale < 4) {
				// At lower zoom levels (zoom in), just plot the wave
				p.noFill();
				p.beginShape();

				// Compute the start index of the wave array we want to plot,
				// given the scaling factor
				start_idx = (p.fftBins * Math.pow(2,p.maxScale)) - (p.fftBins * Math.pow(2,waveScale) );
//				console.log(start_idx);		// For debugging
			
				for (start_pos = 0; start_pos < p.fftBins; start_pos++) {
					vertex(start_pos + move_position, map(p.scaleFactor * p.wave[start_idx + start_pos * Math.pow(2,waveScale) ], -1, 1, 300, 100));
				}
				p.endShape();
			}
			else {
				// At higher zoom levels (zoom out), plot the wave envelope (with fill)
				p.fill(curr_stroke[0],curr_stroke[1],curr_stroke[2]);

				p.beginShape();

				start_idx = (p.fftBins * Math.pow(2,p.maxScale)) - (p.fftBins * Math.pow(2,waveScale) );
				console.log(start_idx);
			
				// Here, we increment each loop by 2 to keep the amount of computation about the same
				for (start_pos = 0; start_pos < p.fftBins; start_pos +=2 ) {
					vertex(start_pos + move_position, map( Math.abs(p.wave[start_idx + start_pos * Math.pow(2,waveScale) ]), 0, 1, 200, 100));
				}

				for (start_pos = p.fftBins; start_pos > 0; start_pos -=2 ) {
					vertex(start_pos + move_position, map( Math.abs(p.wave[start_idx + start_pos * Math.pow(2,waveScale) ]), 0, 1, 200, 300));
				}

				p.endShape();			
			}

			// Draw scale indicator dots
			p.fill(128);
			for (idx=1; idx <= p.maxScale; idx++) {
				if (idx == waveScale) {
					p.strokeWeight(4);
					p.circle(windowWidth-200-p.rightMargin-p.buttonSpacing*idx,p.topMargin,16);
				}
				else {
					p.strokeWeight(0);
					p.circle(windowWidth-200-p.rightMargin-p.buttonSpacing*idx,p.topMargin,10);
				}
			}
			
//			if (p.dot) {
      			p.noFill();
      			p.strokeWeight(5);
      			p.stroke(20);

//				p.circle(p.dot_x, p.dot_y, 50);

//				idx = round( dot_x * (512/width) / Math.pow(2,fftScale) );
//				circle(dot_x, map(p.wave[start_idx + start_pos * Math.pow(2,waveScale) ], 0, 1, 200, 100), 20);
<<<<<<< Updated upstream

				p.beginShape();

				for (i = 0; i < p.drawWave.length; i++ ) {
					vertex(p.drawWave[i][0], p.drawWave[i][1]);
				}
				p.endShape();
=======

			if (wavedraw_mode) {

				if (waveform_bool) {
					p.beginShape();
					for (i = 0; i < p.drawWave.length; i++ ) {
						curveVertex(p.drawWave[i][0], p.drawWave[i][1]);
					}
					p.endShape();
				}
				else if (y_wave.length > 0){
					p.stroke(255,0,0);
					p.beginShape();
					for (i = 0; i < y_wave.length; i++ ) {
						vertex(width * i/y_wave.length, -100*(y_wave[i]*wavedraw_scale) + 200 );
					}			
					p.endShape();
				}
			}
			
				p.beginShape();

				for (i = 0; i < p.drawEnvelope.length; i++ ) {
					vertex(p.drawEnvelope[i][0], p.drawEnvelope[i][1]);
				}
				p.endShape();
				
>>>>>>> Stashed changes
//			}
		} 
    }  

	// Zoom in/out button functions
	p.zoom_in = function() {
		if (waveScale > 1) {
			waveScale -= 1; 
		}
//		console.log(waveScale);
	}

	p.zoom_out = function() {
		if (waveScale < p.maxScale) {
			waveScale += 1;
		}
//		console.log(waveScale);
	}

	p.touchStarted = function() {
		p.dot_x = mouseX;
<<<<<<< Updated upstream
		p.dot_y = mouseY + 368; // Because this canvas is offset -368 from "main" (spectrum) canvas
		p.drawWave = [];
		p.drawWave.push([p.dot_x,p.dot_y]);
=======
		p.dot_y = mouseY + 300; // Because this canvas is offset -300 from "main" (spectrum) canvas

		if (wavedraw_mode == true){
			if (p.dot_y > 100) {
				waveform_bool = true;
				p.drawWave = [];
				//p.drawWave.push([p.dot_x,p.dot_y]);
			}
		}
		if (envelope_bool == true){
			//p.drawEnvelope.push([p.dot_x,p.dot_y]);
			p.drawEnvelope = [];
		}

>>>>>>> Stashed changes
		p.dot = true;
	}
	
	p.touchMoved = function() {
		p.dot_x = mouseX;
<<<<<<< Updated upstream
		p.dot_y = mouseY + 368; // Because this canvas is offset -368 from "main" (spectrum) canvas		
		p.drawWave.push([p.dot_x,p.dot_y]);
=======
		p.dot_y = mouseY + 300; // Because this canvas is offset -368 from "main" (spectrum) canvas		
		if (waveform_bool == true){
			p.drawWave.push([p.dot_x,p.dot_y]);
		}
		if (envelope_bool == true){
			p.drawEnvelope.push([p.dot_x,p.dot_y]);
		}
>>>>>>> Stashed changes
	}

	p.touchEnded = function() {
		if ( (waveform_bool) && (p.drawWave.length > 0) ) {
			num_steps = round(44100/curr_f0);
			y_wave = new Float32Array(num_steps*1).fill(0.0); 
		
			idx = 0;
			for (i=0; i<num_steps; i++) {
				x_target = i*(width/num_steps);
				while ( (idx < p.drawWave.length) && (p.drawWave[idx][0] < x_target )) {
					idx++;
				}
				idx1 = max(idx-1,0);
				idx2 = min(idx, p.drawWave.length - 1);
				if (idx2 != idx1) {
					amt = (x_target - p.drawWave[idx1][0]) / (p.drawWave[idx2][0] - p.drawWave[idx1][0]);
				} else {
					amt = 0.0;
				}
				
				for (w=0; w<1; w++) {
					y_wave[w*num_steps + i] = (lerp(p.drawWave[idx1][1],p.drawWave[idx2][1], amt) - 200)/(-100*wavedraw_scale);
				}
			}

			if (synth.isPlaying) {
				synth.stop();
			}

			synth = new p5.SoundFile();			
			fft.setInput(synth);			
			synth.setBuffer( [y_wave] );
			synth.setLoop(true);
			synth.play();
		}

		waveform_bool = false;
	
		p.dot = false;
	}

}	// End of closure
