//IPAD SCREEN SIZE 
//createCanvas(980, 800); 

var mic, fft, cnv, input, synth, envelope, global_cnv; 
// var points for old fft

//FFT Spectrum Vars
var divisions = 5;
// var speed = 1;
let fftSize = 1024;
var spectra = [];
let fftMaxScale = 4;    // Max scaling factor for fft (spectrum) plot
              // NOTE: *Lower* scale factor is zoomed "out" (shows greater frequency range)
var fftScale = 1;       // Initial fft (spectrum) plot scaling factor: 0...3
let rightMargin = 75;
let dotSpacing = 35;    // Spacing between zoom indicator dots
let topMargin = 10;
let zoomButtonSize = 50;  // Zoom buttons default dimensions
var dot = false;
var dot_x = 0; // cursor position of the initial touch
var dot_y = 0; //^^^
var scrollSpectrum = false;
var scrollStartX;
var scrollStartY;
var scrollCurX;
var scrollCurY;
var scrollOffset = 0;
var textOffset = 0;

let maxSpectrumFrames = 64;

//Mic Vars
var NumButtons = 5; //the amount of sound recording micButtons 
var top_zero = false; 
var micOn = false; 
var buttons = [];
var buttonState = [];
var soundFile = [];
var wave = [];
var pause_fft = 0; //essentially a true or false detecting if the fft should be running or not
var pause_wave = 0; //similar to pause_fft but for the waveform
var curr_points = [12,3,3]; 
var input_gain = 1.0;

//Zoom variables 
var scaling = 1;
var move_position = 0; 
// var temp_x = 0; 
// var temp_y = 0; 
// var start_pos;
var waveScale = 3;      // Initial wave plot scaling factor (power of 2, i.e., 2^3 = 8x)
              // NOTE: higher scale factor is zooming "out", lower is zooming "in"
//Button vars
var header_x = 15; //x position for headers
var slide_x = 15;  //x position for sliders
var descriptor_x = 160; // x position for description text
var frequency_bool = false; //check variables for the buttons
var sound_bool = false;  //^^^
var colour_bool = false; //^^^
var synthesis_bool = false;//^^^
var last_button; //a variable to be used later to dictate specific sidebar components
var colour_button_pos; //a variable to dictate where the colour menu components will draw
let sidebarWidth = 200; //sidebar width
var recording_adjustment = 50; //a variable that will change based upon if there is a sound recording or not

//synthesis Vars
var curr_recorded_sound; //will record whichever button has a sound recorded
var note; //a triangle oscillator to play notes on the keyboard 
var synthesis_slider_start; //takes the y value of when the header buttons stop
var slider_pos; //variable that will help space out the sliders to their correct positions
var sliderNums = 17;//starting from 1 not 0 
//var sliderNums = 10;//starting from 1 not 0 
var sliders = [];
var slider_vals = [];  
var oscillators = [];
var curr_f0 = 440; 
var curr_output = 1; 
var curr_wave = 'sine'; 
var keyboard_bool = false; //check variables for if keyboard button is pressed
var waveform_bool = false; //^^^
var envelope_bool = false; //^^^
var wavedraw_mode = false; //check for if the ability to draw a waveform is available
var envelope_mode = false; //check for if the ability to draw an envelope is available
var s = false;
let slider_x_offset = 88;   // offset needed for slider position when rotating -90deg (to vertical)
let synthGainFudgeFactor = 0.07; //minimizes fft spectrum to an amplitude that stays within the canvas 
let slider_y_default = 400;
var y_wave = [];
var e_wave = [];
var ye_wave = [];
var ye_wave_idx = 0;
var wavedraw_scale = 1;
var return_waveScale; 
var synth_len = 44100; // One second, initially
var preset1 = []; //will adjust sliders/oscillators when pressed and store values of sliders when bool is false
var preset2 = []; //^^^
var preset1_bool = false; 
var preset2_bool = false; 
var sliders_shown_bool = true; 

//Colour Vars; 
var curr_stroke = [255,119,0]; //rgb values that will adjust when sliders are changed
var curr_background = [255,255,255]; //rgb ^^^
var string_colors = "rgb(255,119,0)";
var colour_default_bool = false; //for if the default colour button is pressed

//Keyboard Vars; 
var start_A = 27.5; //Hz for A0 and used for the calculation of frequencies for keyboard
var move_y = 30; //the inital y position of the keyboard
var moveable = false;  //boolean used to dictate if the user can move the keyboard or not
var keyNums = 16 //the amount of white keys present on the keyboard
var sharp_flatNums = 10 //the amount of black keys preset on the keyboard
var white_key_pos = 230; //starting x position for white keys
var black_key_pos = 265; // starting x position for black keys
var octave_start = 3; //the keyboard will start at A3
var curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; //current octaves in keyboard (also used for labels)
var white_keys = []; 
var black_keys = [];  

//Global Setup for Bottom FFT (Landscape Frequency)
function setup() {
  //for Safari use of microphone
  userStartAudio();

//  cnv = createCanvas(windowWidth/1.2, windowHeight/2);
  cnv = createCanvas(windowWidth - sidebarWidth, 400); 
  cnv.position(sidebarWidth, 300);
  global_cnv = windowHeight; 

  //zoom in and out buttons for fft 
  fft_b_zoom_in = createButton("+"); 
  fft_b_zoom_in.position(windowWidth - rightMargin, 300 + topMargin); 
  fft_b_zoom_in.size(zoomButtonSize, zoomButtonSize);
  fft_b_zoom_in.mousePressed(fft_zoom_in);  
  
  fft_b_zoom_out = createButton("-"); 
  fft_b_zoom_out.position(windowWidth - rightMargin - (dotSpacing*fftMaxScale) - (zoomButtonSize+dotSpacing), 300+topMargin); 
  fft_b_zoom_out.size(zoomButtonSize, zoomButtonSize);
  fft_b_zoom_out.mousePressed(fft_zoom_out); 

  //setting the input of the fft to the microphone 
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

  //oscillator creation at starting frequency (curr_f0) of 440
  for (i = 1; i<= sliderNums; i++) {
    oscillators[i] = new p5.Oscillator();
    oscillators[i].freq(440*i);
    oscillators[i].amp(0);
  }

  //pushing 0 to preset lists so that the automatic preset sets all oscillators to zero until it's changed
  for (i=1; i<sliderNums+1; i++) {
    preset1.push(0); 
    preset2.push(0); 
  }

  synth = new p5.SoundFile();
  e_wave = new Float32Array(synth_len).fill(1.0); 
  ye_wave = new Float32Array(synth_len).fill(0.0); 

  // Instantiate the envelope
  envelope = new p5.Envelope();

  // set attackTime, decayTime, sustainRatio, releaseTime
  envelope.setADSR(0.001, 0.5, 0.1, 0.5);   
}


////////////////////////////////////////////////////////////////////////////////

function draw() {
  noFill();

  //aesthetics
//    stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],100); 
  stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],255); 
//    background(curr_background[0],curr_background[1],curr_background[2],1); 
  background(curr_background[0],curr_background[1],curr_background[2],255); 

  //variable to pinpoint correct heights of sound
//  var h = height/divisions; // unused

  // Update current spectrum array, since we're about to draw it
  var spectrum = fft.analyze();
//  var newBuffer = [];   // unused

  // Insert just computed spectrum at the head (index 0) of the spectra array
  spectra.unshift(spectrum.slice(0,512));
  spectra.pop(); // Remove oldest (highest index) spectrum from the spectra array

  drawSpectra();
  
  drawFrequencyLabels();
  zoom_buttons(); 

/*  if (pause_fft == 1 && synthesis_bool == false){
    speed = 0;
    zoom_buttons(); 
  } 
  else{
    speed = 1; 
  } */
  
/*    if (dot) {
      fill(20);
      idx = round( dot_x * (512/width) / Math.pow(2,fftScale) );
      circle(dot_x, map(spectra[0][idx], 0, 255, height-150, 5), 20);
  } */

}

//touch functionality for the global canvas 
function touchStarted() {
  dot_x = mouseX;
  dot_y = mouseY;
  dot = true;

  // console.log(mouseX);
  // console.log(mouseY);
  
  if (mouseY > 300) {
    // start scrolling
    scrollSpectrum = true;
    scrollStartX = mouseX;
    scrollStartY = mouseY;
    scrollCurX = mouseX;
    scrollCutY = mouseY;
  } 
//  return false;
}

function touchMoved() {
  if (scrollSpectrum) {
    scrollStartX = scrollCurX;
    scrollStartY = scrollCurY;
    scrollCurX = mouseX;
    scrollCurY = mouseY;
    
    if (synthesis_bool == true){
      repositionSliders(); 
    }
  }
}

function touchEnded() {
  if (scrollSpectrum) {
    scrollSpectrum = false;
  }
}


function drawSpectra() {
    // Draw current and recent (depending on wave zoom level) FFT frames
    // Set parameters for drawing spectrum frames
    if (waveScale == 1) {
      // Special case for scale = 1 (since 2^1=2), but just show one spectrum frame
      numSpectrumFrames = 1;
    } else {
      numSpectrumFrames = Math.pow(2,waveScale);
      return_waveScale = waveScale; 
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
//      console.log(scrollOffset);
    }
    
  if (fftScale == 0) {
    scrollOffset = 0;
  }
    // Loop to draw current and past spectrum frames
    for (s=0; s<numSpectrumFrames; s += s_inc) {
      if (s==0) {
        strokeWeight(2); 
      } else {
        strokeWeight(1);
      }
        
      stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2],255 - s*(256/numSpectrumFrames)); 

      tempShape = beginShape();

      // Compute the number of spectrum indexes for current fftScale factor
      spectrumEdge = Math.pow(2,9-fftScale); // Goes from 512 > 256 > 128 > 64

      for (i = 0; i < spectrumEdge ; i++) {
        curveVertex(i*(width/512)*Math.pow(2,fftScale), map(spectra[s][i+scrollOffset], 0, 255, height-150+s*(150/numSpectrumFrames), 5+s*(150/numSpectrumFrames)));
    }
    endShape();
  }
}


function drawFrequencyLabels() {
  textAlign(CENTER);
  fill(0);
  strokeWeight(1);
  stroke(curr_stroke[0],curr_stroke[1],curr_stroke[2], 40); 

//  if (scrollSpectrum) {
  textOffset = -width * scrollOffset/512 * Math.pow(2,fftScale);
    
//    textOffset += scrollCurX - scrollStartX;
//    textOffset = max( min(textOffset, 0), -width*(Math.pow(2,fftScale)-1) );
//  }

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
  
//  f_max = min(11000, 11025/Math.pow(2,fftScale) );
  f_max = 11000;
  
  for (f=f_steps; f < f_max; f+= f_steps) {
    this_x = width * f / 11025 * Math.pow(2,fftScale) + textOffset;
    if ( (this_x >= 0) && (this_x < width) )  {
      line(this_x,0,this_x,350);
      text(f, width * f / 11025 * Math.pow(2,fftScale) + textOffset, 350);
    }
  }
}

// Zoom in/out button functions
function fft_zoom_in() {
    if (fftScale < fftMaxScale-1) {
      fftScale += 1;
    }
//    scrollOffset = 0;
//    textOffset = 0;
    if (synthesis_bool == true){
      repositionSliders();  // Re-position sliders
    }
    scrollOffset *= 2;
//    textOffset *= 2;
//    console.log(fftScale);  // For debugging
  }

function fft_zoom_out() {
    if (fftScale > 0) {
      fftScale -= 1; 
    }
//    scrollOffset = 0;
//    textOffset = 0;
    if (synthesis_bool == true){
      repositionSliders();  // Re-position sliders
    }
    scrollOffset = round(scrollOffset/2);
//    textOffset = round(textOffset/2);
//    console.log(fftScale);  // For debugging
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

//Initializing the other javascript files/canvases
var side_bar = new p5(side_bar); 
var space = new p5(); //necessary in order to use windowWidth and windowHeight
var o_p5 = new p5(o_sketch); //this is waveView 
var keyboard_p5 = new p5(keyboard_sketch); //this is keyboardAccess

///////////////////////////////////////////////////////////////////////////////

//Button functions
//generally if the boolean is true, everything in the menu should show and if not eveything should be hidden 
//each section has any functions related to that core function placed below it

function sound_recorder() { 
  //Create a set of buttons to record/play sounds
  sound_bool = !sound_bool;

  if (synthesis_bool == true){
    synthesis_button.style('background-color', '#ffffff');
    synthesis_bool = false; 
    hide_synthesis();

    for (i = 1; i < sliderNums+1; i++) { 
      sliders[i].hide(); 
      oscillators[i].stop(); 
    }
  }

  if (sound_bool == true) {
    sound_button.style('background-color', '#4400ff');

    mic_header.show(); 

    for (i=0; i<NumButtons; i++) {
      buttons[i].show();
      curr_recorded_sound = null; //new set of sounds nothing recorded yet 
    }
  }
  else{
    sound_button.style('background-color', '#ffffff');
    hide_micButtons(); 
  }
}

function hide_micButtons(){
  mic_header.hide(); 
  for (i=0; i<NumButtons; i++) {
      buttons[i].hide(); 
  }
}

//toggle button for micButtons
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

      buttons[idx].html('Play sound '+(idx+1));
      buttons[idx].style('background-color','#00cc00');
      buttonState[idx] = 2;
    }
    else if (buttonState[idx] === 2) {
    stopMic();

      buttons[idx].html('Pause sound '+(idx+1));
      buttons[idx].style('background-color','#cccccc');
      buttonState[idx] = 3;

      curr_recorded_sound = idx; 

      fft.setInput(soundFile[idx]);
      soundFile[idx].onended( donePlaying(idx) );    
      soundFile[idx].play(); // play the result!

    }
    else if (buttonState[idx] == 3) {
    stopMic();

      buttons[idx].html('Play sound '+(idx+1));
      buttons[idx].style('background-color','#00cc00');
      buttonState[idx] = 2;

      fft.setInput(soundFile[idx]);
      soundFile[idx].pause(); // play the result!   
    }
  }
}

function donePlaying(idx) {

  return function() {
    buttons[idx].html('Play sound '+(idx+1));
    buttons[idx].style('background-color','#00cc00');
    buttonState[idx] = 2;
  }
}

function stopMic() {
//  if (micOn) {
//    mic.stop();
    micOn = false;
    mic.amp(0.0);
    micButton.style('background-color','#888888');
    micButton.html("Mic OFF");       
//  }
}

//Dr Kim's audio toggle
function restartMic() {
  if ( !micOn ) {
    pause_wave = 0;
    pause_fft = 0; 
//    mic.start();
  mic.amp(input_gain);
    micOn = true;
    micButton.html('Mic ON');
    micButton.style('background-color', '#4400ff');
  }
  else {
    pause_wave = 1;
    pause_fft = 1; 
    micOn = false;
    micButton.html('Mic OFF');
    micButton.style('background-color', '#ffffff');
  }
}

///////////////////////////////////////////////////////////////////////////////

function synthesizer() {
  synthesis_bool = !synthesis_bool;  

  if (sound_bool == true && curr_recorded_sound != null){
    sound_button.style('background-color', '#ffffff');
    sound_bool = false; 
    mic_header.hide();

    for (i=0; i<=NumButtons-1; i++){
      if (curr_recorded_sound == i){
        buttons[i].position(header_x, last_button + 50); 
        recording_adjustment = 90; 
        synthesis_positions(); 
        recording_adjustment = 50; 
      }
      else{
        buttons[i].hide(); 
      }
    }
  }
  else if (sound_bool == true) {
    sound_button.style('background-color', '#ffffff');
    sound_bool = false;
    recording_adjustment = 50; 
    synthesis_positions(); 
    mic_header.hide();
    hide_micButtons(); 
  }
  else{
    recording_adjustment = 50; 
    synthesis_positions(); 
  }

  // Activate and show synthesizer
  if (synthesis_bool == true) {
    mic.amp(0); // Turn off mic
    stopMic();
    fft.setInput(); 
     
    synthesis_button.style('background-color', '#4400ff');

    for (i=1; i<sliderNums+1; i++) {
//      slider_pos = (curr_f0*i)/11025 * width * (Math.pow(2,fftScale) + scrollOffset/512) + 113;  
      slider_pos = width * Math.pow(2,fftScale) * ((curr_f0*i)/11025 - scrollOffset/512) + slider_x_offset;
  //    print(slider_pos); 
      sliders[i] = createSlider(0,1,0,0); 
      sliders[i].size(225);
      sliders[i].style('transform', 'rotate(-90deg');
      sliders[i].input( updateSlider(i) );
      sliders[i].position(slider_pos, slider_y_default);

  //      if (slider_pos<= windowWidth-200 || slider_pos >= windowWidth){
      if (slider_pos <= 0 || slider_pos > width){
  //        sliders[i].style('background-color', 'transparent')
        sliders[i].hide();
      }
      else {
        sliders[i].style('background-color', string_colors); 
      }
      oscillators[i].start(); 
    }

    synthesis_header.show(); 
    ff1_header.show(); 
    output_header.show(); 

    keyboard_button.show();
    wave_button.show(); 
    slider_button.show(); 
    draw_envelope_button.show(); 
    draw_wave_button.show(); 
    preset1_button.show(); 
    preset2_button.show(); 
    
    overall_frequency_slider.show(); 
    frequency_input.show();
    output_slider.show(); 
    output_slider_input.show(); 

    if (wavedraw_mode) {
      synth.play(); 
    } 

  }
  else { 
    synthesis_button.style('background-color', '#ffffff');

    restartMic();
    fft.setInput(mic); 
    waveScale = return_waveScale; 
    hide_synthesis();

    for (i = 1; i < sliderNums+1; i++) { 
      sliders[i].hide(); 
      oscillators[i].stop(); 
    }

    if (curr_recorded_sound != null){
      hide_micButtons();  
    }
    
    // wavedraw_mode = false;
    if ( synth.isPlaying() ) {
      synth.stop();
    }

    for (i = 0; i< NumButtons; i++){
      buttons[i].position(10,i*45 + last_button + 55);
    }
  }
}

function synthesis_positions(){
    keyboard_button.position(header_x + 10, last_button + recording_adjustment);
    slider_button.position(header_x + 70, last_button + recording_adjustment); 
    wave_button.position(header_x + 130, last_button + recording_adjustment); 

    icon_end = last_button + recording_adjustment + 40; //50 is how large the icon currently is 

    draw_wave_button.position(header_x, icon_end + 15); 
    draw_envelope_button.position(header_x, icon_end + 55); 
    preset1_button.position(header_x, icon_end + 95);
    preset2_button.position(header_x, icon_end + 135);
    synthesis_slider_start = preset2_button.y+ preset2_button.height; 
    ff1_header.position(header_x-20, synthesis_slider_start + 30);
    output_header.position(header_x-75, synthesis_slider_start+90); 
    frequency_input.position(header_x, synthesis_slider_start+55);
    overall_frequency_slider.position(header_x + 40, synthesis_slider_start + 60);
    output_slider.position(header_x + 40, synthesis_slider_start+118);
    output_slider_input.position(header_x, synthesis_slider_start + 115); 
}

function hide_synthesis(){
  synthesis_header.hide(); 
  ff1_header.hide(); 
  output_header.hide(); 

  keyboard_button.hide();
  wave_button.hide(); 
  slider_button.hide(); 
  draw_envelope_button.hide(); 
  draw_wave_button.hide(); 
  preset1_button.hide(); 
  preset2_button.hide(); 

  overall_frequency_slider.hide(); 
  frequency_input.hide();
  output_slider.hide(); 
  output_slider_input.hide();

  // Hide any synthesis drawing waves / envelopes
  wavedraw_mode = false;
  waveform_bool = false;
  envelope_mode = false;
  envelope_bool = false; 

}

function show_sliders(){
  sliders_shown_bool = !sliders_shown_bool;

  if (sliders_shown_bool == true){
    slider_button.style('background-color', '#4400ff');
    for (i = 1; i<sliderNums+1; i++){
      sliders[i].show()
    }
  }
  else{
    slider_button.style('background-color', '#ffffff');
    for (i = 1; i<sliderNums+1; i++){
      sliders[i].hide()
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

//Update Synthesis Section
function update_input_gain() {
  input_gain = mic_input_slider.value();
  mic.amp(input_gain);
  input_slider_input.value( input_gain ); 
}

function update_output_gain() {
  output_slider_input.value( output_slider.value() );
  
  for (i=1; i<sliderNums+1; i++) {
    oscillators[i].amp( sliders[i].value() * output_slider.value() * synthGainFudgeFactor );
  }
}


function updateSlider(idx) {
  return function() {
    oscillators[idx].amp( sliders[idx].value() * output_slider.value() * synthGainFudgeFactor );

    recomputeWave();
  }
}

function repositionSliders(){
// Actually it's re-positioning sliders

/*  for (i = 1; i<sliderNums+1; i++){
    sliders[i].hide(); 
  } */

  // Update values
  curr_f0 = overall_frequency_slider.value();

  for (i=1; i<sliderNums+1; i++) {
    slider_pos = round( width * Math.pow(2,fftScale) * ((curr_f0*i)/11025 - scrollOffset/512) ) + slider_x_offset;
//    sliders[i] = createSlider(0,1,0,0.01); 
//    sliders[i].size(225);
    sliders[i].position(slider_pos, slider_y_default); 
//    sliders[i].style('transform', 'rotate(-90deg)'); 
    oscillators[i].freq(curr_f0 * i);

//      if (slider_pos<= 50 || slider_pos >= 1280){
    if (slider_pos <= slider_x_offset || slider_pos >= width + slider_x_offset){
      sliders[i].hide();
      }
      else{
        sliders[i].style('background-color', string_colors); 
        sliders[i].show();
      }
  }
}

function frequency_change() { 
  curr_f0 = frequency_input.value();
  
//  overall_frequency_slider.value(frequency_input.value()); 
  overall_frequency_slider.value(curr_f0);
  repositionSliders();
  recomputeWave();
}

function update_f0() {
  frequency_input.value(curr_f0);
  repositionSliders();
  recomputeWave();
}

function recomputeWave() {
  period = round(44100/curr_f0);
  round_f0 = round(44100/period);
  
  synth_len = period * round_f0;
  if (synth_len < 44100) {
    synth_len += period;
  }
  
  if (y_wave.length != synth_len) {
    y_wave = [];
    y_wave = new Float32Array(synth_len);
    ye_wave = [];
    ye_wave = new Float32Array(synth_len);      
  }

  for (i=0; i<synth_len; i++) {
    y_wave[i] = 0;
    for (s=1; s<=sliderNums; s++) {
      x = i/44100;
      y_wave[i] += sliders[s].value() * sin(TWO_PI * (round_f0 * s) * x); 
    }
    
    ye_wave[i] = y_wave[i] * e_wave[i];
  }
  ye_wave_idx = 0;
}


function input_change(){
  input_gain = parseFloat( input_slider_input.value() );
  mic.amp(input_gain);
  mic_input_slider.value( input_gain ); 
}

function output_change() {
  output_slider.value( parseFloat(output_slider_input.value()) );
  for (i=1; i<sliderNums+1; i++) {
    oscillators[i].amp( sliders[i].value() * output_slider.value() );
  }    
}

function updateWaveType(wave_type){

  if (wave_type == 'sine'){
    for (i = 1; i <= sliderNums; i++){
      if (i != 1){
        oscillators[i].amp(0); 
        sliders[i].value(0); 
      }
    }
  }
  else if (wave_type == 'square'){
    for (i = 1; i <= sliderNums; i++){
      if (i%2 == 0){
        oscillators[i].amp(0); 
        sliders[i].value(0);
      }
      else{
        var inverse_num = 1/i; 
        oscillators[i].amp(inverse_num * output_slider.value() * synthGainFudgeFactor); 
        sliders[i].value(inverse_num);
      } 
    }
  }
  else if (wave_type == 'saw'){
    for (i = 1; i<= sliderNums; i++){
      var inverse_num = 1/i;
      oscillators[i].amp(inverse_num * output_slider.value() * synthGainFudgeFactor); 
      sliders[i].value(inverse_num);  
    }
  }
  recomputeWave(); 
}

//Oscillator Wave Settings 
function set_waveType(change_wave) {

  return function() {

    // make sure user enabled the mic
    if (change_wave === 'sine') {
      wave_button.style('background-image', "url(square_icon.png)");
      change_wave = 'square';//this is so that the toggle keeps on moving 
      //curr_wave = 'square';
      
    }
    else if (change_wave === 'square') {  
      wave_button.style('background-image', "url(sawtooth_icon.png)");  
      change_wave = 'saw';
      //curr_wave = 'sawtooth';
       
    }
    else if (change_wave === 'saw') {
      wave_button.style('background-image', "url(sine_icon.png)"); 
      change_wave = 'sine';
      //curr_wave = 'sine';
      
    }
    updateWaveType(change_wave); 
  }
}

function wave_drawing(){
  wavedraw_mode = !wavedraw_mode; 
  //wavedraw_mode = true;
  
  if (envelope_mode){
    envelope_mode = false; 
    draw_envelope_button.style('background-color', '#ffffff');
    
  }

  if (wavedraw_mode == true){
    draw_wave_button.style('background-color', '#4400ff');

    stopOscillators();

  }
  else{
    draw_wave_button.style('background-color', '#ffffff');
    startOscillators(); 
  }
}

function envelope_drawing(){
  envelope_mode = !envelope_mode; 
  //envelope_mode = true;
  
  if (wavedraw_mode){
    draw_wave_button.style('background-color', '#ffffff');
    wavedraw_mode = false; 
  }

  if (envelope_mode){
    draw_envelope_button.style('background-color', '#4400ff');

    stopOscillators();
  }
  else{
    draw_envelope_button.style('background-color', '#ffffff');
    startOscillators(); 
  }
}

function stopOscillators() {
  for (idx=1; idx<=sliderNums; idx++) {
    oscillators[idx].stop();
  }
}

function startOscillators() {
  for (idx=1; idx<=sliderNums; idx++) {
    oscillators[idx].start();
  }
}

//preset/manual options for if users want to save certain values for sliders
function set_preset1(){
  preset1_bool = !preset1_bool; 

  if (preset1_bool == true){
    preset1_button.style('background-color', '#4400ff');
    for (i=1; i<sliderNums; i++){
      sliders[i].value(preset1[i]); 
      oscillators[i].amp(preset1[i] * output_slider.value() * synthGainFudgeFactor );
    }
    recomputeWave(); 
  }
  else{
    preset1_button.style('background-color', '#ffffff');
  }
}

function set_preset2(){
  preset2_bool = !preset2_bool
  if (preset2_bool == true){
    preset2_button.style('background-color', '#4400ff');
    for (i=1; i<sliderNums; i++){
      sliders[i].value(preset2[i]); 
      oscillators[i].amp(preset2[i] * output_slider.value() * synthGainFudgeFactor );
    }
    recomputeWave(); 
  }
  else{
    preset2_button.style('background-color', '#ffffff');
  }
}

function updatePresets(preset_num){
  for (i=1; i<sliderNums+1; i++) {
    preset_num[i] = sliders[i].value(); 
  }
}

///////////////////////////////////////////////////////////////////////////////
//Changing the colours of the background, sliders, and lines

function colour_adjustment() { 
  colour_bool = !colour_bool;

  //this locks out the colour adjusting menu 
  if (synthesis_bool == true || sound_bool == true){
    colour_bool =false; 
  }

  if (colour_bool == true) {
    colour_button.style('background-color', '#4400ff');

    colour_header.show(); 
    line_header.show(); 
    background_header.show(); 
    default_button.show(); 

    rline_slide.show(); 
    gline_slide.show(); 
    bline_slide.show(); 

    red_slide.show(); 
    green_slide.show(); 
    blue_slide.show(); 
    
  }
  else{
    colour_button.style('background-color', '#ffffff');
    hide_colours(); 
  }
}

function hide_colours(){
  colour_header.hide() ;
  line_header.hide(); 
  background_header.hide(); 
  default_button.hide(); 

  rline_slide.hide(); 
  gline_slide.hide(); 
  bline_slide.hide(); 

  red_slide.hide(); 
  green_slide.hide(); 
  blue_slide.hide(); 
}

function default_setting(){
  colour_default_bool = true; 
  updateColours(); 
}

function updateColours(){
  if (colour_default_bool == false){
    stroke(rline_slide.value(),gline_slide.value(),bline_slide.value(),255);
    background(red_slide.value(),green_slide.value(),blue_slide.value(),255);
  }
  else{
      rline_slide.value(255); 
      gline_slide.value(119); 
      bline_slide.value(0); 

      red_slide.value(255); 
      green_slide.value(255); 
      blue_slide.value(255); 

      colour_default_bool = false; 
  }
  
  //saves the values of the sliders so that if colour adjuster isn't in view the colour will stay the same
  curr_stroke[0] = rline_slide.value();
  curr_stroke[1] = gline_slide.value();
  curr_stroke[2] = bline_slide.value();   
  curr_background[0] = red_slide.value();
  curr_background[1] = green_slide.value();
  curr_background[2] = blue_slide.value();

  string_colors = "rgb(" + curr_stroke[0] + "," + curr_stroke[1] + "," + curr_stroke[2] + ")"; 

  mic_input_slider.style('background-color', string_colors); 
  overall_frequency_slider.style('background-color', string_colors);
  output_slider.style('background-color', string_colors); 
  
}

///////////////////////////////////////////////////////////////////////////////

//Keyboard function 
function access_keyboard(){
  keyboard_bool = !keyboard_bool; 

  if (keyboard_bool == true){
    keyboard_button.style('background-color', '#4400ff');

    //essentially the area in which if touched, will allow for the user to move the keyboard
    move_box = createDiv(" "); 
    move_box.class("move_box_style"); 
    move_box.position(30, move_y); 

    left_button = createDiv(" <<< "); 
    left_button.class("piano_button_style");
    left_button.mousePressed(keyboard_p5.move_left)

    right_button = createDiv(" >>> "); 
    right_button.class("piano_button_style"); 
    right_button.mousePressed(keyboard_p5.move_right);  

    recreateKeys();

    keyboard_p5.resizeCanvas(windowWidth-200, windowHeight); 

  }
  else{
    keyboard_button.style('background-color', '#ffffff');

    clearKeys(); 

    keyboard_p5.clear(); 
    left_button.hide(); 
    right_button.hide(); 
    move_box.hide(); 

    keyboard_p5.resizeCanvas(0, 0); 
  }
}

function clearKeys(){
  for (i =0; i<= keyNums; i++){
    white_keys[i].hide(); 
    black_keys[i].hide(); 
  }
}

function recreateKeys(){
  var whiteWidth = (windowWidth-200)/keyNums; //width of the white keys
  var blackWidth = whiteWidth/2; //width of the black keys

  //white keys
  for (i = 0; i<= keyNums; i++){ 
      fill(230,230,230); 
      var label;
      if (i == 0){
        label = curr_octaves[0];
      }
      else if (i == 7){
        label = curr_octaves[1];
      }
      else if (i == 14){
        label = curr_octaves[2];
      }
      else{
        label = " "; 
      }
      white_keys[i] = createDiv(label); 
      white_keys[i].class("piano_white_key_style")
      white_keys[i].style('width', whiteWidth + "px"); 
      white_keys[i].mousePressed(playNote(i)); 

      //black keys
      fill(0,0,0); 
      black_keys[i] = createDiv(" "); 
      black_keys[i].class("piano_black_key_style")
      black_keys[i].style('width', blackWidth + "px");
      black_keys[i].mousePressed(playFlat(i));
    }
  
}
///////////////////////////////////////////////////////////////////////////////

function windowResized() {
  if (keyboard_bool == true){
      clearKeys(); 
      recreateKeys(); 
  }

  if (synthesis_bool == true){
    repositionSliders(); 
  }

  resizeCanvas(windowWidth - sidebarWidth, 400); 
  cnv.position(sidebarWidth, 300); 
  fft_b_zoom_in.position(windowWidth - rightMargin, 300 + topMargin); 
  fft_b_zoom_out.position(windowWidth - rightMargin - (dotSpacing*fftMaxScale) - (zoomButtonSize+dotSpacing), 300+topMargin); 

  o_p5.resizeCanvas(windowWidth - 200, 300); 
  //o_p5.position(200,0); 
  o_p5.o_zoom_in.position(windowWidth - o_p5.rightMargin,20); 
  o_p5.o_zoom_out.position(windowWidth - o_p5.rightMargin - (o_p5.maxScale*o_p5.buttonSpacing) - (zoomButtonSize+o_p5.buttonSpacing),20); 

  // if (cnv.y == global_cnv){ //enable scrolling when the height is adjusted 
  //   select('body').attribute('position', 'static'); 
  // }
}

///////////////////////////////////////////////////////////////////////////////

//OLD CODE
//Frequency Adjuster option most of functionality code taken from (https://github.com/therewasaguy/p5-music-viz/tree/gh-pages/demos)
// function frequency_sliders() { 
//   frequency_bool = !frequency_bool;

//   if (frequency_bool == true) {
//     frequency_button.style('background-co lor', '#4400ff');

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

