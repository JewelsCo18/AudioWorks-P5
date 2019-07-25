//IPAD SCREEN SIZE 
//createCanvas(980, 800); 

var mic, fft, cnv, input, points, backgroundColorPicker, NumButtons;

//Spectrum Vars
var divisions = 5;
var speed = 1;
let fftSize = 1024;
var spectra = [];
let fftMaxScale = 4;		// Max scaling factor for fft (spectrum) plot
							// NOTE: *Lower* scale factor is zoomed "out" (shows greater frequency range)
var fftScale = 1; 			// Initial fft (spectrum) plot scaling factor: 0...3
let rightMargin = 75;
let dotSpacing = 35;		// Spacing between zoom indicator dots
let topMargin = 50;
let zoomButtonSize = 50;	// Zoom buttons default dimensions
var dot = false;
var dot_x = 0;
var dot_y = 0;
var scrollSpectrum = false;
var scrollStartX;
var scrollStartY;
var scrollCurX;
var scrollCurY;
var scrollOffset = 0;
var textOffset = 0;

//Mic Vars
var top_zero = false; 
var micOn = false;
var buttons = [];
var buttonState = [];
var soundFile = [];
var wave = [];
var mic;
var pause_fft = 0; 
var pause_wave = 0; 
var curr_points = [12,3,3]; 

//Zoom variables 
var scaling = 1;
var move_position = 0; 
var temp_x = 0; 
var temp_y = 0; 
var start_pos;
var waveScale = 3;			// Initial wave plot scaling factor (power of 2, i.e., 2^3 = 8x)
							// NOTE: higher scale factor is zooming "out", lower is zooming "in"
//Button vars
var header_x = 10;
var slide_x = 15;  
var descriptor_x = 160;
var frequency_bool = false; 
var sound_bool = false; 
var colour_bool = false; 
var synthesis_bool = false;
var last_button;
var colour_button_pos; 

//synthesis 
var sliderNums = 17;//starting from 1 not 0 
var sliders = [];
var slider_vals = [];  
var oscillators = [];
var curr_fft = 440;  
var curr_frequency_text;
var curr_wave = 'sine'; 
var sine_bool = true; 
var square_bool = false; 
var saw_bool = false; 

//Colour Vars; 
var curr_stroke = [255,119,0]; //rgb
var curr_background = [255,255,255]; //rgb
var string_colors = "rgb(255,119,0)";

//test vars
let maxSpectrumFrames = 64;

//Global Setup for Bottom FFT (Landscape Frequency)
function setup() {
	//for safari use of microphone
	userStartAudio();

  //scroll 
//  window.scrollTo(0,20); 
//  window.scrollBy(0,20); 

//	cnv = createCanvas(windowWidth/1.2, windowHeight/2);
//  cnv = createCanvas(980 - (139), 400); 
	cnv = createCanvas(windowWidth - 200, 400); 
	cnv.position(200, 368); 

	fft_b_zoom_in = createButton("+"); 
	fft_b_zoom_in.position(windowWidth - rightMargin, 420); 
	fft_b_zoom_in.size(zoomButtonSize, zoomButtonSize);
	fft_b_zoom_in.mousePressed(fft_zoom_in);  
  
	fft_b_zoom_out = createButton("-"); 
	fft_b_zoom_out.position(windowWidth - rightMargin - (dotSpacing*fftMaxScale) - (zoomButtonSize+dotSpacing), 420); 
	fft_b_zoom_out.size(zoomButtonSize, zoomButtonSize);
	fft_b_zoom_out.mousePressed(fft_zoom_out); 

  	mic = new p5.AudioIn(); 
	mic.start();
	micOn = true;

	fft = new p5.FFT(0.8, 1024);
	fft.setInput(mic);

	// create a sound recorder
	recorder = new p5.SoundRecorder();

	// connect the mic to the recorder
	recorder.setInput(mic);

	// Initialize array for past spectrum frames (spectra)
	for (s=0; s<maxSpectrumFrames; s++) {  
		spectra[s] = new Array(512).fill(0); 
	}

  //oscillator creation
  for (i = 1; i<= sliderNums; i++) {
    oscillators[i] = new p5.Oscillator();
    oscillators[i].freq(440*i);
    oscillators[i].amp(0); 
  }
  
}


////////////////////////////////////////////////////////////////////////////////

function draw() {
	noFill();

	//variable to pinpoint correct heights of sound
	var h = height/divisions;
	var spectrum = fft.analyze();
	var newBuffer = [];

	spectra.unshift(spectrum.slice(0,512));
	spectra.pop();

	//aesthetics
	if (colour_bool == true) {
		stroke(rline_slide.value(),gline_slide.value(),bline_slide.value(),255);
		background(red_slide.value(),green_slide.value(),blue_slide.value(),255);
		curr_stroke[0] = rline_slide.value();
		curr_stroke[1] = gline_slide.value();
		curr_stroke[2] = bline_slide.value();   
		curr_background[0] = red_slide.value();
		curr_background[1] = green_slide.value();
		curr_background[2] = blue_slide.value();
    string_colors = "rgb(" + curr_stroke[0] + "," + curr_stroke[1] + "," + curr_stroke[2] + ")";  
	}
	else{
//		stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],100); 
		stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],255); 
//		background(curr_background[0],curr_background[1],curr_background[2],1); 
		background(curr_background[0],curr_background[1],curr_background[2],255); 
	}

  //synthesis 
  if (synthesis_bool == true){
    curr_fft = overall_frequency_slider.value(); 
    for (i = 1; i <= sliderNums; i++) {
      oscillators[i].freq(curr_fft*i);
      oscillators[i].amp(sliders[i].value()); 
      oscillators[i].setType(curr_wave); 
      sliders[i].style('background-color', string_colors); 
      overall_frequency_slider.style('background-color', string_colors); 
    } 
    //updating text
    // for (i = 1; i <= sliderNums; i++) { 
    //   fill(0,0,0); 
    //   text("Current Frequency" + curr_fft, 230, 430); 
    //   text(sliders[i].value(), 45+i*47, 700); 
    // }
  }
  
  //FFT
	if (1) {
//		speed = 10; 

		// Set parameters for drawing spectrum frames
		if (waveScale == 1) {
			// Special case for scale = 1 (since 2^1=2), but just show one spectrum frame
			numSpectrumFrames = 1;
		} else {
			numSpectrumFrames = Math.pow(2,waveScale);
		}		
		
		// Change loop increment based on scale
		if (waveScale == 6) {
			s_inc = 8;
		} else if (waveScale == 5) {
			s_inc = 4;
		} else if (waveScale == 4) {
			s_inc = 2;
		} else {
			s_inc = 1; 
		}

		if (scrollSpectrum) {
			fftScaleBins = Math.pow(2,9-fftScale); // Number of spectrum points (bins) in plot at current fftScale
			scrollOffset += round( fftScaleBins * (scrollStartX - scrollCurX)/width );
			scrollOffset = max( min(scrollOffset, 512-fftScaleBins-1), 0);
//			console.log(scrollOffset);
		}
		
		if (fftScale == 0) {
			scrollOffset = 0;
		}

		
		// Loop to draw current and past spectrum frames
		for (s=0; s<numSpectrumFrames; s += s_inc) {
			if (s==0) {
				strokeWeight(2);
			}
			else {
				strokeWeight(1);
			}
			
			stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],255 - s*(256/numSpectrumFrames)); 
			
			beginShape();

			// Compute the number of spectrum indexes for current fftScale factor
			spectrumEdge = Math.pow(2,9-fftScale); // Goes from 512 > 256 > 128 > 64
						
			for (i = 0; i < spectrumEdge ; i++) {
				curveVertex(i*(width/512)*Math.pow(2,fftScale), map(spectra[s][i+scrollOffset], 0, 255, height-150+s*(150/numSpectrumFrames), 5+s*(150/numSpectrumFrames)));
			}
			endShape();
		}

		drawFrequencyLabels();
    	zoom_buttons(); 
	}
	else if (pause_fft == 1 && synthesis_bool == false){
		speed = 0;
    	zoom_buttons(); 
	}	
  else{
    speed = 1; 
  }
  
/*    if (dot) {
  		fill(20);
  		idx = round( dot_x * (512/width) / Math.pow(2,fftScale) );
  		circle(dot_x, map(spectra[0][idx], 0, 255, height-150, 5), 20);
  } */

}


function touchStarted() {
	dot_x = mouseX;
	dot_y = mouseY;
	dot = true;

	console.log(mouseX);
	console.log(mouseY);
	
	if (mouseY > 300) {
		// start scrolling
		scrollSpectrum = true;
		scrollStartX = mouseX;
		scrollStartY = mouseY;
		scrollCurX = mouseX;
		scrollCutY = mouseY;
	}	
//	return false;
}

function touchMoved() {
	if (scrollSpectrum) {
		scrollStartX = scrollCurX;
		scrollStartY = scrollCurY;
		scrollCurX = mouseX;
		scrollCurY = mouseY;
	}
}

function touchEnded() {
	if (scrollSpectrum) {
		scrollSpectrum = false;
	}
}


function drawFrequencyLabels() {
	textAlign(CENTER);
	fill(0);

	if (scrollSpectrum) {
		textOffset += scrollCurX - scrollStartX;
		textOffset = max( min(textOffset, 0), -width*(Math.pow(2,fftScale)-1) );
	}
	if (fftScale == 0) {
		textOffset = 0;
	}


	if (fftScale == 3) {
		f_steps = 250;
	} else if (fftScale > 1) {
		f_steps = 500;
	} else {
		f_steps = 1000;
	}
	
//	f_max = min(11000, 11025/Math.pow(2,fftScale) );
	f_max = 11000;
	
	for (f=f_steps; f < f_max; f+= f_steps) {
		this_x = width * f / 11025 * Math.pow(2,fftScale) + textOffset;
		if ( (this_x >= 0) && (this_x < width) )  {
			text(f, width * f / 11025 * Math.pow(2,fftScale) + textOffset, 350);
		}
	}
}

// Zoom in/out button functions
function fft_zoom_in() {
		if (fftScale < fftMaxScale-1) {
			fftScale += 1;
		}
		scrollOffset = 0;
		textOffset = 0;
//		scrollOffset *= 2;
//		textOffset *= 2;
//		console.log(fftScale);	// For debugging
	}

function fft_zoom_out() {
		if (fftScale > 0) {
			fftScale -= 1; 
		}

		scrollOffset = 0;
		textOffset = 0;
//		scrollOffset = round(scrollOffset/2);
//		textOffset = round(textOffset/2);
//		console.log(fftScale);	// For debugging
	}

function zoom_buttons(){
  // Draw scale indicator dots
  fill(128);
    for (idx=0; idx < fftMaxScale; idx++) {
      if (idx == fftScale) {
        // Draw dot for the current fftScale selection bigger, plus a thicker stroke
        strokeWeight(4);
        circle(windowWidth - 200 - rightMargin - dotSpacing*(fftMaxScale-idx), topMargin+zoomButtonSize/2, 16);
      }
      else {
        strokeWeight(0);
        circle(windowWidth - 200 - rightMargin - dotSpacing*(fftMaxScale-idx), topMargin+zoomButtonSize/2, 10);
      }
    } 
}

////////////////////////////////////////////////////////////////////////////////

//Where all descriptions and text go
var side_bar = function(p) { 

  p.setup = function() {
    var side_cnv = p.createCanvas(200, windowHeight); 
    side_cnv.position(0,0);
    p.noLoop();

    micButton = createDiv('Mic ON');
    micButton.class('subheader_style');
    micButton.mousePressed(restartMic);
    micButton.position(10, topMargin + 50); 
    micButton.style('background-color', '#4400ff');

    sound_button = createDiv("Sound Recorder"); 
    sound_button.class('subheader_style'); 
    sound_button.mousePressed(sound_recorder); 
    sound_button.position(10, topMargin + 100); 

    // frequency_button = createDiv("Frequency Adjuster"); 
    // frequency_button.class('subheader_style'); 
    // frequency_button.mousePressed(frequency_sliders); 
    // frequency_button.position(10, 130); 

    synthesis_button = createDiv("Synthesizer"); 
    synthesis_button.class('subheader_style'); 
    synthesis_button.mousePressed(synthesizer); 
    synthesis_button.position(10, topMargin + 150);

    last_button = synthesis_button.y + synthesis_button.height; 

    colour_button = createDiv("Colors"); 
    colour_button.class('subheader_style'); 
    colour_button.mousePressed(colour_adjustment); 
    colour_button.position(10, windowHeight-30); 

    colour_button_pos = windowHeight-30-colour_button.height
    
  }

  p.draw = function() {
    p.fill(255,255,255); 
    p.textFont('Helvetica');
    var last_button = synthesis_button.y +synthesis_button.height/2; 

    //Headers
    p.textSize(26); 
    p.text('AudioWorks-P5', header_x, topMargin+25);

    //General Text Size 
    p.textSize(14);

    if (sound_bool == true) { 
      p.text("Record and play back sound", header_x, last_button+ 45); 
    }

    if (frequency_bool == true){
      //Frequency Blurb
      p.text("Slide through values 0 to 15", header_x, last_button + 45);
      p.text("to change frequency range input", header_x, last_button+ 60);

      // //frequency slider descriptions
      p.text("Bass", descriptor_x, last_button + 75); 
      p.text("Mid", descriptor_x, last_button + 95);  
      p.text("Treble", descriptor_x, last_button + 115);
    }
    
    if (colour_bool == true) {
      //colour picker description
      p.text("Change line/background color", header_x, colour_button_pos - 210); 

      //colour slider descriptions
      p.text("Line Color", header_x, colour_button_pos - 185); 
      p.text("Red", descriptor_x, colour_button_pos - 165); 
      p.text("Green", descriptor_x, colour_button_pos - 135); 
      p.text("Blue", descriptor_x, colour_button_pos - 105); 

      p.text("Background Color", header_x, colour_button_pos - 75); 
      p.text("Red", descriptor_x, colour_button_pos - 55); 
      p.text("Green", descriptor_x, colour_button_pos - 25); 
      p.text("Blue", descriptor_x, colour_button_pos+5); 
    }
    
    if (synthesis_bool == true) { 
      p.text("Synthesize your own sound", header_x, last_button + 45); 
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

var side_bar = new p5(side_bar); 
var space = new p5(); 
var o_p5 = new p5(o_sketch);

///////////////////////////////////////////////////////////////////////////////

//Button functions

function sound_recorder() { 
  //Create a set of buttons to record/play sounds
  sound_bool = !sound_bool;

  if (synthesis_bool == true){
    synthesis_button.style('background-color', '#ffffff');
    synthesis_bool = false; 

    side_bar.clear(); 
    side_bar.redraw();
    recreateButtons();  

    pause_fft = 0; 
    fft.setInput(mic); 
    keyboard_button.hide();
    sine_button.hide(); 
    saw_button.hide(); 
    square_button.hide();  

    overall_frequency_slider.hide(); 
    for (i = 1; i < sliderNums+1; i++) { 
      sliders[i].hide(); 
      oscillators[i].stop(); 
    } 
  }

  if (sound_bool == true) {
    sound_button.style('background-color', '#4400ff');
    side_bar.redraw(); 

    if (colour_bool == true){
      NumButtons = 6; 
    }
    else{
      NumButtons = 11; 
    }
    for (i=0; i<NumButtons; i++) {
      buttons[i] = createDiv('Record sound '+ (i+1));
      buttons[i].class('mic_style');
      buttons[i].mousePressed( toggleButton(i) );
      buttons[i].position(10,i*45 + last_button + 50);
      buttonState[i] = 0;
      
      // this sound file will be used to
      // playback & save the recording
      soundFile[i] = new p5.SoundFile();      
    }
  }

  else{
    sound_button.style('background-color', '#ffffff');
    for (i=0; i<NumButtons; i++) {
      buttons[i].hide(); 
    }
    side_bar.clear(); 
    side_bar.redraw();
  }
}

function colour_adjustment() { 
  colour_bool = !colour_bool;

  if (sound_bool == true){
    for (i = 6; i<=10; i++){ //11 is most amount of numButtons
      buttons[i].hide(); 
    }
  }

  if (colour_bool == true) {
    colour_button.style('background-color', '#4400ff');

    side_bar.redraw(); 

    //Stroke Sliders

    rline_slide = createSlider(0, 255, curr_stroke[0],1); 
    rline_slide.position(slide_x, colour_button_pos - 180); 
    rline_slide.style('background-image', 'linear-gradient(to right,black,red')

    //////

    gline_slide = createSlider(0,255, curr_stroke[1],1);
    gline_slide.position(slide_x, colour_button_pos - 150); 
    gline_slide.style('background-image', 'linear-gradient(to right,black,green')

    ////

    bline_slide = createSlider(0,255,curr_stroke[2],1); 
    bline_slide.position(slide_x, colour_button_pos - 120); 
    bline_slide.style('background-image', 'linear-gradient(to right,black,blue')

    //Background Sliders

    red_slide = createSlider(0, 255, curr_background[0],1);
    red_slide.position(slide_x, colour_button_pos - 70); 
    red_slide.style('background-image', 'linear-gradient(to right,black,red')

    /////////

    green_slide = createSlider(0,255, curr_background[1],1);
    green_slide.position(slide_x, colour_button_pos - 40); 
    green_slide.style('background-image', 'linear-gradient(to right,black,green')

    /////////

    blue_slide = createSlider(0,255,curr_background[2],1);
    blue_slide.position(slide_x, colour_button_pos - 10); 
    blue_slide.style('background-image', 'linear-gradient(to right,black,blue')
  }
  else{
    colour_button.style('background-color', '#ffffff');

    rline_slide.hide(); 
    gline_slide.hide(); 
    bline_slide.hide(); 

    red_slide.hide(); 
    green_slide.hide(); 
    blue_slide.hide(); 

    side_bar.clear(); 
    side_bar.redraw();  

  }
}

function synthesizer() {
  synthesis_bool = !synthesis_bool;  

  if (sound_bool == true){
    sound_button.style('background-color', '#ffffff');
    sound_bool = false; 
    side_bar.clear(); 
    side_bar.redraw(); 

    for (i=0; i<=NumButtons-1; i++){
      buttons[i].hide(); 
    }
  }

  if (synthesis_bool == true) { 
    synthesis_button.style('background-color', '#4400ff');
    pause_fft = 1; 

    side_bar.clear();
    side_bar.redraw(); 
    fft_b_zoom_in.hide(); 
    fft_b_zoom_out.hide(); 
    
    overall_frequency_slider = createSlider(0,1000,440); 
    overall_frequency_slider.size((windowWidth-200)/1.25); 
    overall_frequency_slider.position(95+ (windowWidth-200)/5, 430); 
    overall_frequency_slider.style('background-color', string_colors); 

    var slider_pos = (windowWidth-200)/sliderNums-1
    for (i=1; i<sliderNums+1; i++) {
      sliders[i] = createSlider(0,1,0,0.01); 
      sliders[i].size(225);
      sliders[i].style('transform', 'rotate(-90deg'); 
      sliders[i].position(80 + slider_pos, 575);  
      sliders[i].style('background-color', string_colors); 
      oscillators[i].start();  
      fft.setInput(oscillators[i]); 
      slider_pos += (windowWidth-200)/sliderNums-1;
    }

    keyboard_button = createDiv("Keyboard ON"); 
    keyboard_button.class("button_style"); 
    keyboard_button.mousePressed(access_keyboard); 
    keyboard_button.position(header_x, last_button + 50);

    sine_button = createDiv("Sine"); 
    sine_button.class("button_style");
    sine_button.style('background-color', '#4400ff'); 
    sine_button.mousePressed(sine_setting); 
    sine_button.position(header_x, last_button + 90);

    saw_button = createDiv("Sawtooth"); 
    saw_button.class("button_style"); 
    saw_button.mousePressed(saw_setting); 
    saw_button.position(header_x, last_button + 130);

    square_button = createDiv("Square"); 
    square_button.class("button_style");
    square_button.mousePressed(square_setting);  
    square_button.position(header_x, last_button + 170);
  }

  else{ 
    synthesis_button.style('background-color', '#ffffff');

    pause_fft = 0; 
    fft.setInput(mic); 

    keyboard_button.hide();
    sine_button.hide(); 
    saw_button.hide(); 
    square_button.hide();  

    side_bar.clear(); 
    side_bar.redraw();
    recreateButtons();  

    overall_frequency_slider.hide(); 
    for (i = 1; i < sliderNums+1; i++) { 
      sliders[i].hide(); 
      oscillators[i].stop(); 
    }
  }
}

// function frequency_sliders() { 
//   frequency_bool = !frequency_bool;

//   if (frequency_bool == true) {
//     frequency_button.style('background-color', '#4400ff');

//     side_bar.redraw(); 
//     //Frequency Sliders
//     trebleslider = createSlider(0,15,curr_points[0]); 
//     trebleslider.position(slide_x, last_button + 105); 

//     midslider = createSlider(0,15,curr_points[1]); 
//     midslider.position(slide_x, last_button + 85 ); 

//     bassslider = createSlider(0,15,curr_points[2]); 
//     bassslider.position(slide_x, last_button + 65); 
      
//   }
//   else{
//     frequency_button.style('background-color', '#ffffff');

//     bassslider.hide(); 
//     midslider.hide(); 
//     trebleslider.hide();
//     side_bar.clear(); 
//     side_bar.redraw(); 
//   }
  
// }

///////////////////////////////////////////////////////////////////////////////
//Keyboard function 

function access_keyboard(){
  keyboard_bool = !keyboard_bool; 

  if (keyboard_bool == true){
    keyboard_button.style('background-color', '#4400ff');
  }
  else{
    keyboard_button.style('background-color', '#ffffff');
  }
}

///////////////////////////////////////////////////////////////////////////////
//Oscillator Wave Settings 

function sine_setting(){
  sine_bool = !sine_bool;

  if (sine_bool == true) {
    sine_button.style('background-color', '#4400ff');
    curr_wave = 'sine';
  }
  else{
    sine_button.style('background-color', '#ffffff'); 
  }
  
}

function saw_setting(){
  saw_bool = !saw_bool
  if (saw_bool == true) {
    saw_button.style('background-color', '#4400ff');
    curr_wave = 'sawtooth';
  }
  else{
    saw_button.style('background-color', '#ffffff');
    curr_wave = 'sine'; 
  }
}

function square_setting(){
  square_bool = !square_bool; 
  if (square_bool == true) {
    square_button.style('background-color', '#4400ff');
    curr_wave = 'square';
  }
  else{
    square_button.style('background-color', '#ffffff');
    curr_wave = 'sine';
  }
}

///////////////////////////////////////////////////////////////////////////////



//Dr. Kim's toggle button for Mic button 
function toggleButton(idx) {

  return function() {

    // make sure user enabled the mic
    if (buttonState[idx] === 0 && micOn) {
      // record to our p5.SoundFile
      recorder.record(soundFile[idx]);

      buttons[idx].html('Stop recording'); 
      buttons[idx].style('background-color','#ff0000');
      buttonState[idx] = 1;
    }
    else if (buttonState[idx] === 1) {

      // stop recorder and
      // send result to soundFile
      recorder.stop();

      buttons[idx].html('Play sound '+idx);
      buttons[idx].style('background-color','#00cc00');
      buttonState[idx] = 2;
    }
    else if (buttonState[idx] === 2) {
		stopMic();

      buttons[idx].html('Pause sound '+idx);
      buttons[idx].style('background-color','#cccccc');
		buttonState[idx] = 3;

      fft.setInput(soundFile[idx]);
      soundFile[idx].onended( donePlaying(idx) );    
      soundFile[idx].play(); // play the result!
    }
    else if (buttonState[idx] == 3) {
		stopMic();

      buttons[idx].html('Play sound '+idx);
      buttons[idx].style('background-color','#00cc00');
		buttonState[idx] = 2;

      fft.setInput(soundFile[idx]);
      soundFile[idx].pause(); // play the result!    
    
    
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

function donePlaying(idx) {

	return function() {
		buttons[idx].html('Play sound '+idx);
		buttons[idx].style('background-color','#00cc00');
		buttonState[idx] = 2;
	}
}

function stopMic() {
	if (micOn) {
		mic.stop();
		micOn = false;
		micButton.style('background-color','#888888');
		micButton.html("Mic OFF");       
	}
}

//Dr Kim's audio toggle
function restartMic() {
  if ( !micOn ) {
    pause_wave = 0;
    pause_fft = 0; 
    mic.start();
    micOn = true;
    micButton.html('Mic ON');
    micButton.style('background-color', '#4400ff');
  }
  else {
    pause_wave = 1;
    pause_fft = 1; 
    micOn = false;
    mic.stop();
    micButton.html('Mic OFF');
    micButton.style('background-color', '#ffffff');
  }
}

function recreateButtons() { 
  fft_b_zoom_in = createButton("+"); 
  fft_b_zoom_in.position(windowWidth - rightMargin, 420); 
  fft_b_zoom_in.size(zoomButtonSize, zoomButtonSize);
  fft_b_zoom_in.mousePressed(fft_zoom_in);  
  
  fft_b_zoom_out = createButton("-"); 
  fft_b_zoom_out.position(windowWidth - rightMargin - (dotSpacing*fftMaxScale) - (zoomButtonSize+dotSpacing), 420); 
  fft_b_zoom_out.size(zoomButtonSize, zoomButtonSize);
  fft_b_zoom_out.mousePressed(fft_zoom_out); 
}

//OLD CODE 
// function splitOctaves(spectrum, slicesPerOctave) {
//   fft.analyze(); 

//   var scaledSpectrum = [];
//   var len = spectrum.length;

//   // default to thirds
//     //optional adjustment of spectrum points dependent of frequency ranges
//   if (frequency_bool == true) {
//     if (top_zero == false) {
//       if (fft.getEnergy("treble") == true) {
//         points = trebleslider.value();
//         curr_points[0] = trebleslider.value(); 
//       }
//       else if (fft.getEnergy("bass") == true) {
//           points = bassslider.value();
//           curr_points[2] = bassslider.value(); 
//         }

//       else {
//           if (fft.getEnergy("lowMid") == true) {
//             points = bassslider.value(); 
//             curr_points[2] = bassslider.value(); 
//           }
//           else if (fft.getEnergy("highMid") == true) {
//             points = trebleslider.value(); 
//             curr_points[0] = trebleslider.value(); 
//           }
//           else {
//             points = midslider.value();
//             curr_points[1] = midslider.value(); 
//           }  
//         }
//       } 
//     else{
//       points = 0; 
//     }
//   }
//   else{
//     if (fft.getEnergy("treble") == true) { 
//       points = curr_points[0]; 
//     }
//     else if (fft.getEnergy("bass") == true) {
//           points = curr_points[2];
//         }

//     else {
//         if (fft.getEnergy("lowMid") == true) {
//           points = curr_points[2];
//         }
//         else if (fft.getEnergy("highMid") == true) {
//           points = curr_points[0]; 
//         }
//         else {
//           points = curr_points[1]; 
//         }  
//       }
//   }

//   //print("array", trebleslider.value(), bassslider.value(), midslider.value()); 
//   //print(points);
//   var nthRootOfTwo = Math.pow(2, 1/points);

//   // the last N bins get their own 
//   var lowestBin = slicesPerOctave;

//   var binIndex = len - 1;
//   var i = binIndex;


//   while (i > lowestBin) {
//     var nextBinIndex = round( binIndex/nthRootOfTwo );

//     if (nextBinIndex === 1) return;

//     var total = 0;
//     var numBins = 0;

//     // add up all of the values for the frequencies
//     for (i = binIndex; i > nextBinIndex; i--) {
//       total += spectrum[i];
//       numBins++;
//     }

//     // divide total sum by number of bins
//     var energy = total/numBins;
//     scaledSpectrum.push(energy);

//     // keep the loop going
//     binIndex = nextBinIndex;
//   }

//   // add the lowest bins at the end
//   for (var j = i; j > 0; j--) {
//     scaledSpectrum.push(spectrum[j]);
//   }

//   // reverse so that array has same order as original array (low to high frequencies)
//   scaledSpectrum.reverse();

//   return scaledSpectrum;
// }

// // average a point in an array with its neighbors
// function smoothPoint(spectrum, index, numberOfNeighbors) {

//   // default to 2 neighbors on either side
//   var neighbors = numberOfNeighbors || 2;
//   var len = spectrum.length;
//   var val = 0;

//   // start below the index
//   var indexMinusNeighbors = index - neighbors;
//   var smoothedPoints = 0;

//   for (var i = indexMinusNeighbors; i < (index+neighbors) && i < len; i++) {
//     // if there is a point at spectrum[i], tally it
//     if (typeof(spectrum[i]) !== 'undefined') {
//       val += spectrum[i];
//       smoothedPoints++;
//     }
//   }

//   val = val/smoothedPoints;

//   return val;
// }

