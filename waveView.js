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
	p.topMargin = 50;	// Margin from top for interface elements
	p.buttonSize = 50;	// Size of zoom buttons
	p.buttonSpacing=25;	// Spacing between zoom indicators	
	var o_cnv;			// Canvas for this view
	p.wave = [];		// Array for storing / plotting sound wave
	p.fftBins = 1024;	// Default buffer size for p5.js FFT object
	p.maxScale = 6;		// Maximum wave plot scaling factor (power of 2, i.e., 2^6 = 64x)

/* The following are defined in master js file (FFT_Wave_CV.js)
	waveScale = 3;		// Initial wave plot scaling factor (power of 2, i.e., 2^3 = 8x)
						// NOTE: higher scale factor is zooming "out", lower is zooming "in"
	zoomButtonSize = 50;// Zoom button default dimensions
*/


	p.setup = function() {
//		o_cnv = p.createCanvas(980 - (139), 400);
		o_cnv = p.createCanvas(windowWidth - 220, 400);
		o_cnv.position(220,0); 

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
			p.wave.splice(0,1024);

			if (waveScale < 4) {
				// At lower zoom levels (zoom in), just plot the wave
				p.noFill();
				p.beginShape();

				// Compute the start index of the wave array we want to plot,
				// given the scaling factor
				start_idx = (p.fftBins * Math.pow(2,p.maxScale)) - (p.fftBins * Math.pow(2,waveScale) );
//				console.log(start_idx);		// For debugging
			
				for (start_pos = 0; start_pos < p.fftBins; start_pos++) {
					vertex(start_pos + move_position, map(p.wave[start_idx + start_pos * Math.pow(2,waveScale) ], 0, 1, 200, 100));
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
					p.circle(windowWidth-220-p.rightMargin-p.buttonSpacing*idx,p.topMargin,16);
				}
				else {
					p.strokeWeight(0);
					p.circle(windowWidth-220-p.rightMargin-p.buttonSpacing*idx,p.topMargin,10);
				}
			}		
			
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

}	// End of closure