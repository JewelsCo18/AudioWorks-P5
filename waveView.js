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
	p.drawEnvelope = [];

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

		//zoom in and out buttons for waveView 
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
//		if (pause_wave == 0) {
			p.strokeWeight(2);

			//aesthetics for waveView
			p.stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2]); 
			p.background(curr_background[0],curr_background[1],curr_background[2]); 
		
			if (synthesis_bool) {

				//p.scaleFactor = 0.5 / synthGainFudgeFactor;
				if (wavedraw_mode) {
					p.scaleFactor = wavedraw_scale;
				} else {
					p.scaleFactor = 1;
				}

				if (envelope_mode == false) {
					waveScale = 1;	// Force max zoom for synth mode, unless in envelope mode
				
				// Add wave with envelope (ye_wave) to the end of p.wave array and remove oldest p.wave samples				
//				p.wave = p.wave.concat( Array.prototype.slice.call( ye_wave.slice(0,2048) ) ); // old call
				p.wave = p.wave.concat( Array.from( ye_wave.slice(0,2048) ) );
				p.wave.splice(0,2048);
				}
				else {
					p.wave = p.wave.concat(fft.waveform());
					// There's no guarantee that successive frames are contiguous (possible dropouts)
					// Probably want to fix this, at least for synthesis
					p.wave.splice(0,1024);				
				}
			}
			else {
				p.scaleFactor = 1;

				if (pause_wave == 0) {
					p.wave = p.wave.concat(fft.waveform());
					// There's no guarantee that successive frames are contiguous (possible dropouts)
					// Probably want to fix this, at least for synthesis
					p.wave.splice(0,1024);
				}
			}

			if (waveScale < 4) {
				// At lower zoom levels (zoom in), just plot the wave
				p.noFill();
				p.beginShape();

//				if (synthesis_bool == false) {
				// Compute the start index of the wave array we want to plot,
				// given the wave scaling (zoom) factor
				start_idx = (p.fftBins * Math.pow(2,p.maxScale)) - (p.fftBins * Math.pow(2,waveScale) );
//				console.log(start_idx);		// For debugging
//				}
			
				for (start_pos = 0; start_pos < p.fftBins; start_pos++) {
					vertex(start_pos + move_position, map(p.scaleFactor * p.wave[start_idx + start_pos * Math.pow(2,waveScale) ], -1, 1, 300, 100));
				}
				p.endShape();
				
				p.stroke(0);
				p.strokeWeight(0.5);
				p.line(move_position,200, width, 200);
				
				p.stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2]); 
				p.strokeWeight(2);
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

			if (wavedraw_mode) {

				if (waveform_bool) {
					p.beginShape();
					for (i = 0; i < p.drawWave.length; i++ ) {
						vertex(p.drawWave[i][0], p.drawWave[i][1]);
//						curveVertex(p.drawWave[i][0], p.drawWave[i][1]);
					}
					p.endShape();
				}
/*				else if (y_wave.length > 0){
					p.stroke(255,0,0);
					p.beginShape();
//					for (i = 0; i < y_wave.length; i++ ) {
					for (i = 0; i < period; i++ ) {
						vertex(width * i/y_wave.length, -100*(y_wave[i]*wavedraw_scale) + 200 );
					}			
					p.endShape();
				} */
			}
			
			if (envelope_mode) {
				if (envelope_bool) {
					if (p.drawEnvelope.length > 0) {
						p.fill(200);
						p.beginShape();

						for (i = 0; i < p.drawEnvelope.length; i++ ) {
							vertex(p.drawEnvelope[i][0], p.drawEnvelope[i][1]);
						}
					
						for (i = p.drawEnvelope.length - 1; i >=0 ; i-- ) {
							vertex(p.drawEnvelope[i][0], 400-p.drawEnvelope[i][1]);
						}
					
						p.endShape();
					}
				}
			}
				
//			}
//		} 
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

	//touch functionality for waveView canvas
	p.touchStarted = function() {
		p.dot_x = mouseX;
		p.dot_y = mouseY + 300; // Because this canvas is offset -300 from "main" (spectrum) canvas

		start_point = [p.dot_x,p.dot_y];

		if (wavedraw_mode == true){
			if (p.dot_y > 100) {
//				waveform_bool = true;
				//p.drawWave.push([p.dot_x,p.dot_y]);
			}
		}
		if (envelope_mode){
			//p.drawEnvelope.push([p.dot_x,p.dot_y]);
//			envelope_bool = true;
//			p.drawEnvelope = [];
		}

		p.dot = true;
	}
	
	p.touchMoved = function() {
		p.dot_x = mouseX;
		p.dot_y = mouseY + 300; // Because this canvas is offset -368 from "main" (spectrum) canvas
		print('x: ' + p.dot_x);
		print('y: ' + p.dot_y);	
		if (wavedraw_mode){
			// Check if touch points are "in canvas"
			if ( (start_point.length > 0) && (start_point[0] > 0) && (start_point[1] < 300) ) {
				waveform_bool = true;
				p.drawWave = [];
				p.drawWave.push(start_point);
				start_point = [];
			}
			p.drawWave.push([p.dot_x,p.dot_y]);
			return false;
		}
		if (envelope_mode){
			// Check if touch points are "in canvas"
			if ( (start_point.length > 0) && (start_point[0] > 0) && (start_point[1] < 300) ) {
				envelope_bool = true;
				p.drawEnvelope = [];
				p.drawEnvelope.push(start_point);
				start_point = [];
			}
			p.drawEnvelope.push([p.dot_x,p.dot_y]);
			return false;
		}		
	}

	p.touchEnded = function() {
	
		if ( (waveform_bool) && (p.drawWave.length > 0) && (mouseX > 200) ) {
			p.updateWaveSynth();
		}
		else if ( (envelope_bool) && (p.drawEnvelope.length > 0) && (mouseX > 200) ) {
			p.updateEnvelope();
		}
		else if ( (wavedraw_mode) || (envelope_mode) ) {
//			envelope.play(synth,0);
			if ( (mouseX > 200) && (mouseY+300 > 100) && (mouseY+300 < 300) ) {
				synth.play();
			}
		}
		p.dot = false;
	}


	p.updateWaveSynth = function() {
		period = round(44100/curr_f0);
		round_f0 = round(44100/period);
		
		num_steps = ceil(44100/curr_f0);
		synth_len = period * round_f0;
		if (synth_len < 44100) {
			synth_len += period;
		}
//		num_periods = round(synth_len / round_f0);
		
		y_wave = new Float32Array(synth_len).fill(0.0);
	
		idx = 0;
		for (i=0; i<period; i++) {
			x_target = i*(width/period);
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
			
			for (w=0; w<round_f0; w++) {
				y_wave[w*period + i] = (lerp(p.drawWave[idx1][1],p.drawWave[idx2][1], amt) - 200)/(-100*wavedraw_scale);
			}
		}

		if (e_wave.length > 0) {
			p.updateSynth();
		}
		else {		
			if (synth.isPlaying) {
				synth.stop();
			}

			synth = new p5.SoundFile();			
			fft.setInput(synth);			
			synth.setBuffer( [y_wave] );
			synth.setLoop(true);
		
	//		envelope.setLoop(true);
	//		envelope.play();

	//		synth.setVolume(envelope);
	//		envelope.setLoop(true);

	//		envelope.play(synth, 0); //, 0.1);
			synth.play();  
		}
		
		waveform_bool = false;	
	}
	

	p.updateEnvelope = function() {
		synth_len = 44100; // One second		

		e_wave = new Float32Array(synth_len).fill(0.0);
	
		idx = 0;
		for (i=0; i<synth_len; i++) {
			x_target = i*(width/synth_len);
			while ( (idx < p.drawEnvelope.length) && (p.drawEnvelope[idx][0] < x_target )) {
				idx++;
			}
			idx1 = max(idx-1,0);
			idx2 = min(idx, p.drawEnvelope.length - 1);
			if (idx2 != idx1) {
				amt = (x_target - p.drawEnvelope[idx1][0]) / (p.drawEnvelope[idx2][0] - p.drawEnvelope[idx1][0]);
			} else {
				amt = 0.0;
			}

			e_wave[i] = abs( (lerp(p.drawEnvelope[idx1][1],p.drawEnvelope[idx2][1], amt) - 200)/(-100*wavedraw_scale) );
		}

//		if (y_wave.length > 0) {
			p.updateSynth();
//		}

		envelope_bool = false;
		waveScale = 4;
	}	


	p.updateSynth = function() {
		ye_wave = [];
//		ye_wave = new Float32Array(synth_len);
		ye_wave = new Float32Array(44100); // One second

		if (y_wave.length != synth_len) {
			y_wave = [];
			y_wave = new Float32Array(synth_len).fill(0.0);
			
			for (i=0; i<synth_len; i++) {
//				y_wave[i] = 0;
				for (s=1; s<=sliderNums; s++) {
					x = i/44100;
//					y_wave[i] += sliders[s].value() * sin(TWO_PI * (round_f0 * s) * x);	
					y_wave[i] += slider_amps[s] * sin(TWO_PI * (round_f0 * s) * x);	
				}
		
				ye_wave[i] = y_wave[i] * e_wave[i];
			}
		}
		else {			
			for (i=0; i<synth_len; i++) {
				ye_wave[i] = y_wave[i] * e_wave[i];
			}
		}
		ye_wave_idx = 0;

		if (synth.isPlaying()) {
			synth.stop();
		}

		synth = new p5.SoundFile();			
		fft.setInput(synth);			
		synth.setBuffer( [ye_wave] );
//			synth.setLoop(true);
		synth.play();  
	}


}	// End of closure