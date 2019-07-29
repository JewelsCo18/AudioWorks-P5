//IPAD SCREEN SIZE 
//createCanvas(980, 800); 

var mic, fft, cnv, input, points;

//SideBar Vars
var curr_subheader; 

//Spectrum Vars
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
var dot_x = 0;
var dot_y = 0;
var scrollSpectrum = false;
var scrollStartX;
var scrollStartY;
var scrollCurX;
var scrollCurY;
var scrollOffset = 0;
var textOffset = 0;

let maxSpectrumFrames = 64;

//Mic Vars
var NumButtons = 5; 
var top_zero = false; 
var micOn = false;
var buttons = [];
var buttonState = [];
var soundFile = [];
var wave = [];
var pause_fft = 0; 
var pause_wave = 0; 
var curr_points = [12,3,3]; 
var input_gain = 1.0;

//Zoom variables 
var scaling = 1;
var move_position = 0; 
var temp_x = 0; 
var temp_y = 0; 
var start_pos;
var waveScale = 3;      // Initial wave plot scaling factor (power of 2, i.e., 2^3 = 8x)
              // NOTE: higher scale factor is zooming "out", lower is zooming "in"
//Button vars
var header_x = 15;
var slide_x = 15;  
var descriptor_x = 160;
var frequency_bool = false; 
var sound_bool = false; 
var colour_bool = false; 
var synthesis_bool = false;
var last_button;
var colour_button_pos;
let sidebarWidth = 200; 

//synthesis Vars
var curr_recorded_sound, initial_x, initial_y, note, synthesis_slider_start, slider_pos, curr_f0_text; 
var sliderNums = 17;//starting from 1 not 0 
//var sliderNums = 10;//starting from 1 not 0 
var sliders = [];
var slider_vals = [];  
var oscillators = [];

var curr_f0 = 440; 
var curr_wave = 'sine'; 
var keyboard_bool = false;
var waveform_bool = false;
var wavedraw_mode = false; 
var envelope_bool = false;
let slider_x_offset = 88;   // offset needed for slider position when rotating -90deg (to vertical)
let synthGainFudgeFactor = 0.07;
let slider_y_default = 400;
var y_wave = [];
let wavedraw_scale = 6;

//Colour Vars; 
var curr_stroke = [255,119,0]; //rgb
var curr_background = [255,255,255]; //rgb
var string_colors = "rgb(255,119,0)";
var default_bool = false; 

//Keyboard Vars; 
var move_y = 30; 
var moveable = false; 
var keyNums = 16 //starting at A3
var sharp_flatNums = 10 //starting at A3
var white_key_pos = 230; 
var black_key_pos = 255;
var octave_start = 3; 
var curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; 
var white_keys = []; 
var black_keys = [];  

//test vars

//Global Setup for Bottom FFT (Landscape Frequency)
function setup() {
  //for Safari use of microphone
  userStartAudio();

//  cnv = createCanvas(windowWidth/1.2, windowHeight/2);
  cnv = createCanvas(windowWidth - sidebarWidth, 400); 
  cnv.position(sidebarWidth, 300); 

  fft_b_zoom_in = createButton("+"); 
  fft_b_zoom_in.position(windowWidth - rightMargin, 300 + topMargin); 
  fft_b_zoom_in.size(zoomButtonSize, zoomButtonSize);
  fft_b_zoom_in.mousePressed(fft_zoom_in);  
  
  fft_b_zoom_out = createButton("-"); 
  fft_b_zoom_out.position(windowWidth - rightMargin - (dotSpacing*fftMaxScale) - (zoomButtonSize+dotSpacing), 300+topMargin); 
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

  synth = new p5.SoundFile();  
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
    
    repositionSliders();
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
    repositionSliders();  // Re-position sliders
    scrollOffset *= 2;
    scrollOffset = 0;
    textOffset = 0;
//    scrollOffset *= 2;
  }

function fft_zoom_out() {
    if (fftScale > 0) {
      fftScale -= 1; 
    }
//    scrollOffset = 0;
//    textOffset = 0;
    repositionSliders();  // Re-position sliders
    scrollOffset = round(scrollOffset/2);
    scrollOffset = 0;
    textOffset = 0;
//    scrollOffset = round(scrollOffset/2);

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
    var side_cnv = p.createCanvas(200, 800); 
    side_cnv.position(0,0);
    p.noLoop();

    //MAIN SIDE BUTTONS
    micButton = createDiv('Mic ON');
    micButton.class('subheader_style');
    micButton.style('background-color', '#4400FF');
    micButton.mousePressed(restartMic);
    micButton.position(header_x, 50); 

    input_slider = createSlider(0,5,1,0); 
    input_slider.size(170);
    input_slider.position(header_x, 120); 
    input_slider.style('background-color', string_colors);
    input_slider.input(update_input_gain); 

    input_slider_input = createInput("1.0"); 
    input_slider_input.size(40); 
    input_slider_input.position(header_x +130, 95); 
    input_slider_input.input(input_change);
  //  input_slider_input.value(input_gain);

    input_header = createDiv('Input:'); 
    input_header.class('subheader_text_style'); 
    input_header.position(header_x-75, 95); 

    sound_button = createDiv("Sound Recorder"); 
    sound_button.class('subheader_style'); 
    sound_button.mousePressed(sound_recorder); 
    sound_button.position(header_x, 150); 

    // frequency_button = createDiv("Frequency Adjuster"); 
    // frequency_button.class('subheader_style'); 
    // frequency_button.mousePressed(frequency_sliders); 
    // frequency_button.position(10, 130); 

    synthesis_button = createDiv("Synthesizer"); 
    synthesis_button.class('subheader_style'); 
    synthesis_button.mousePressed(synthesizer); 
    synthesis_button.position(header_x, 190);

    last_button = synthesis_button.y + synthesis_button.height; 

    colour_button = createDiv("Colour Adjuster"); 
    colour_button.class('subheader_style'); 
    colour_button.mousePressed(colour_adjustment); 
    colour_button.position(header_x, windowHeight-10-70); 
    colour_button_pos = windowHeight-10-colour_button.height - 70;

    //MIC SECTION 

    mic_header = createDiv('Record and play back sound'); 
    mic_header.class('subheader_text_style'); 
    mic_header.position(header_x-10, last_button+ 30); 

    for (i=0; i<NumButtons; i++) {
      buttons[i] = createDiv('Record sound '+ (i+1));
      buttons[i].class('mic_style');
      buttons[i].mousePressed( toggleButton(i) );
      buttons[i].position(10,i*45 + last_button + 55);
      buttonState[i] = 0;
       
      // this sound file will be used to
      // playback & save the recording
      soundFile[i] = new p5.SoundFile();     
    }

    hide_micButtons();

    //COLOUR SECTION 

    //p.text("Change line/background color", header_x, colour_button_pos - 210); 
    line_header = createDiv('Line Color'); 
    line_header.class('subheader_text_style'); 
    line_header.position(header_x-70, colour_button_pos - 210); 

    background_header = createDiv('Background Color'); 
    background_header.class('subheader_text_style'); 
    background_header.position(header_x-45, colour_button_pos - 90); 

    default_button = createButton("Default"); 
    default_button.position(header_x + 120, colour_button_pos - 210); 
    default_button.mousePressed(default_setting); 

    //Stroke Sliders
    rline_slide = createSlider(0, 255, curr_stroke[0],1); 
    rline_slide.position(slide_x, colour_button_pos - 180); 
    rline_slide.size(170); 
    rline_slide.style('background-image', 'linear-gradient(to right,black,red')

    gline_slide = createSlider(0,255, curr_stroke[1],1);
    gline_slide.position(slide_x, colour_button_pos - 150); 
    gline_slide.size(170); 
    gline_slide.style('background-image', 'linear-gradient(to right,black,green')

    bline_slide = createSlider(0,255,curr_stroke[2],1); 
    bline_slide.position(slide_x, colour_button_pos - 120);
    bline_slide.size(170); 
    bline_slide.style('background-image', 'linear-gradient(to right,black,blue')

    //Background Sliders
    red_slide = createSlider(0, 255, curr_background[0],1);
    red_slide.position(slide_x, colour_button_pos - 70); 
    red_slide.size(170); 
    red_slide.style('background-image', 'linear-gradient(to right,black,red')

    green_slide = createSlider(0,255, curr_background[1],1);
    green_slide.position(slide_x, colour_button_pos - 40); 
    green_slide.size(170); 
    green_slide.style('background-image', 'linear-gradient(to right,black,green')

    blue_slide = createSlider(0,255,curr_background[2],1);
    blue_slide.position(slide_x, colour_button_pos - 10); 
    blue_slide.size(170); 
    blue_slide.style('background-image', 'linear-gradient(to right,black,blue')

    hide_colours(); //to ensure the start screen doesn't have the colour adjsuters

    //SYNTHESIS SECTION 

    synthesis_header = createDiv('Synthesize your own sound'); 
    synthesis_header.class('subheader_text_style'); 
    synthesis_header.position(header_x-10, last_button + 27);

    var recording_adjustment = 50; 

    keyboard_button = createDiv(" "); 
    keyboard_button.class("keyboard_style"); 
    keyboard_button.mousePressed(access_keyboard); 
    keyboard_button.position(header_x + 20, last_button + recording_adjustment);

    wave_button = createDiv(" "); 
    wave_button.class("waveType_style"); 
    wave_button.mousePressed(set_waveType('sine')); 
    wave_button.position(header_x + 100, last_button + recording_adjustment); 

    icon_end = last_button + recording_adjustment + 50; //50 is how large the icon currently is 

    draw_wave_button = createDiv("Draw Waveform"); 
    draw_wave_button.class("button_style"); 
    draw_wave_button.mousePressed(wave_drawing); 
    draw_wave_button.position(header_x, icon_end + 15); 

    draw_envelope_button = createDiv("Draw Envelope"); 
    draw_envelope_button.class("button_style"); 
    draw_envelope_button.mousePressed(envelope_drawing); 
    draw_envelope_button.position(header_x, icon_end + 55); 

    preset1_button = createDiv("Preset 1"); 
    preset1_button.class("button_style"); 
    preset1_button.mousePressed(set_preset1); 
    preset1_button.position(header_x, icon_end + 95);

    preset2_button = createDiv("Preset 2"); 
    preset2_button.class("button_style"); 
    preset2_button.mousePressed(set_preset2); 
    preset2_button.position(header_x, icon_end + 135);  

    synthesis_slider_start = preset2_button.y+ preset2_button.height; 

    ff1_header = createDiv('Fundamental'); 
    ff1_header.class('subheader_text_style'); 
    ff1_header.position(header_x-60, synthesis_slider_start + 25);

    ff2_header = createDiv('Frequency:'); 
    ff2_header.class('subheader_text_style'); 
    ff2_header.position(header_x-65, synthesis_slider_start + 40); 

    output_header = createDiv('Output:'); 
    output_header.class('subheader_text_style'); 
    output_header.position(header_x-75, synthesis_slider_start+90); 

    frequency_input = createInput(""); 
    frequency_input.size(70); 
    frequency_input.position(header_x + 100, synthesis_slider_start+33); 
    frequency_input.style("height", "20px"); 
    frequency_input.input(frequency_change); 
    frequency_input.value(curr_f0);

    overall_frequency_slider = createSlider(50,1000,curr_f0,0);
    overall_frequency_slider.size(170); 
    overall_frequency_slider.position(header_x, synthesis_slider_start + 65); 
    overall_frequency_slider.style('background-color', string_colors);
    overall_frequency_slider.input(repositionSliders); // set callback for value changes

    output_slider = createSlider(0,1,1,0); 
    output_slider.size(170);
    output_slider.position(header_x, synthesis_slider_start+120); 
    output_slider.style('background-color', string_colors);
    output_slider.input(update_output_gain);

    output_slider_input = createInput(""); 
    output_slider_input.size(70); 
    output_slider_input.position(header_x +100, synthesis_slider_start + 90); 
    output_slider_input.input(output_change);  

    hide_synthesis() //to ensure that everything is hidden initially 
    
  }

  p.draw = function() {
    p.fill(255,255,255); 
    p.textFont('Helvetica');
//    p.background(0,0,0); 

    var last_button = synthesis_button.y +synthesis_button.height/2; 

    //Headers
    p.textSize(36); 
    p.text('AudioWorks', header_x,35);


    // if (frequency_bool == true){
    //   //Frequency Blurb
    //   p.text("Slide through values 0 to 15", header_x, last_button + 45);
    //   p.text("to change frequency range input", header_x, last_button+ 60);

    //   // //frequency slider descriptions
    //   p.text("Bass", descriptor_x, last_button + 75); 
    //   p.text("Mid", descriptor_x, last_button + 95);  
    //   p.text("Treble", descriptor_x, last_button + 115);
    // }
    
  }

  p.touchMoved = function(){
    updateColours(); 
  }
}

////////////////////////////////////////////////////////////////////////////////

var side_bar = new p5(side_bar); 
var space = new p5(); 
var o_p5 = new p5(o_sketch);
var keyboard_p5 = new p5(keyboard_sketch); 

///////////////////////////////////////////////////////////////////////////////

//Button functions

function sound_recorder() { 
  //Create a set of buttons to record/play sounds
  sound_bool = !sound_bool;

  if (synthesis_bool == true){
    synthesis_button.style('background-color', '#ffffff');
    synthesis_bool = false; 
    hide_synthesis(); 
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

///////////////////////////////////////////////////////////////////////////////

function colour_adjustment() { 
  colour_bool = !colour_bool;

  if (colour_bool == true) {
    colour_button.style('background-color', '#4400ff');

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
  default_bool = true; 
  updateColours(); 
}

function updateColours(){
  if (default_bool == false){
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

      default_bool = false; 
  }
  
  curr_stroke[0] = rline_slide.value();
  curr_stroke[1] = gline_slide.value();
  curr_stroke[2] = bline_slide.value();   
  curr_background[0] = red_slide.value();
  curr_background[1] = green_slide.value();
  curr_background[2] = blue_slide.value();

  string_colors = "rgb(" + curr_stroke[0] + "," + curr_stroke[1] + "," + curr_stroke[2] + ")"; 

  input_slider.style('background-color', string_colors); 
  overall_frequency_slider.style('background-color', string_colors);
  output_slider.style('background-color', string_colors); 
  
}

///////////////////////////////////////////////////////////////////////////////

function synthesizer() {
  synthesis_bool = !synthesis_bool;  

  if (sound_bool == true && curr_recorded_sound != null){
    sound_button.style('background-color', '#ffffff');
    sound_bool = false; 

    for (i=0; i<=NumButtons-1; i++){
      if (buttonState[i] == 2){
        buttons[i].position(header_x, last_button + 50); 
        recording_adjustment = 90; 
      }
      else{
        buttons[i].hide(); 
      }
    }
  }
  else if (sound_bool == true) {
    sound_button.style('background-color', '#ffffff');
    sound_bool = false;
    hide_micButtons(); 
  }

  // Activate and show synthesizer
  if (synthesis_bool == true) {
    mic.amp(0); // Turn off mic
     
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
    ff2_header.show(); 
    output_header.show(); 

    keyboard_button.show();
    wave_button.show(); 
    draw_envelope_button.show(); 
    draw_wave_button.show(); 
    preset1_button.show(); 
    preset2_button.show(); 
    
    overall_frequency_slider.show(); 
    frequency_input.show();
    output_slider.show(); 
    output_slider_input.show(); 

    stopMic();
    fft.setInput(); 
  }
  else { 
    synthesis_button.style('background-color', '#ffffff');

    restartMic();
    fft.setInput(mic); 
    hide_synthesis(); 

    for (i = 1; i < sliderNums+1; i++) { 
      sliders[i].hide(); 
      oscillators[i].stop(); 
    }

    if (curr_recorded_sound!= null){
      buttons[curr_recorded_sound].hide(); 
    }
    
    wavedraw_mode = false;
    if ( synth.isPlaying() ) {
      synth.stop();
    }
  }
}

function hide_synthesis(){
  synthesis_header.hide(); 
  ff1_header.hide(); 
  ff2_header.hide(); 
  output_header.hide(); 

  keyboard_button.hide();
  wave_button.hide(); 
  draw_envelope_button.hide(); 
  draw_wave_button.hide(); 
  preset1_button.hide(); 
  preset2_button.hide(); 

  overall_frequency_slider.hide(); 
  frequency_input.hide();
  output_slider.hide(); 
  output_slider_input.hide(); 

}

function update_input_gain() {
  input_gain = input_slider.value();
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
  }
}

function repositionSliders(){
// Actually it's re-positioning sliders

/*  for (i = 1; i<sliderNums+1; i++){
    sliders[i].hide(); 
  } */

  // Update values
  curr_f0 = overall_frequency_slider.value();
  frequency_input.value(curr_f0);

  for (i=1; i<sliderNums+1; i++) {
    slider_pos = round( width * Math.pow(2,fftScale) * ((curr_f0*i)/11025 - scrollOffset/512) ) + slider_x_offset;
//    sliders[i] = createSlider(0,1,0,0.01); 
//    sliders[i].size(225);
    sliders[i].position(slider_pos, slider_y_default); 
//    sliders[i].style('transform', 'rotate(-90deg)'); 
    oscillators[i].freq(curr_f0 * i);

//      if (slider_pos<= 50 || slider_pos >= 1280){
    if (slider_pos <= slider_x_offset || slider_pos >= width + slider_x_offset){
//        sliders[i].style('background-color', 'transparent')
//        print("transparent"); //for some reason I can't remove the back 
      sliders[i].hide();
      }
      else{
//    sliders[i].style('background-color', string_colors); 
    sliders[i].show();
      }
  }
    fft.setInput(mic); 
  }


function frequency_change() { 
  curr_f0 = frequency_input.value();
  
//  overall_frequency_slider.value(frequency_input.value()); 
  overall_frequency_slider.value(curr_f0);
  repositionSliders();
}

function input_change(){
  input_gain = parseFloat( input_slider_input.value() );
  mic.amp(input_gain);
  input_slider.value( input_gain ); 
}

function output_change() {
  output_slider.value( parseFloat(output_slider_input.value()) );
  for (i=1; i<sliderNums+1; i++) {
    oscillators[i].amp( sliders[i].value() * output_slider.value() );
  } 
}   

function updateWaveType(){
  for (i = 1; i <= sliderNums; i++) {
      oscillators[i].setType(curr_wave); 
  }
}

//Oscillator Wave Settings 
function set_waveType(change_wave) {

  return function() {

    // make sure user enabled the mic
    if (change_wave === 'sine') {
      wave_button.style('background-image', "url(sine_icon.png)"); 
      curr_wave = 'square';
      change_wave = 'square';//this is so that the toggle keeps on moving 
      updateWaveType(); 
    }
    else if (change_wave === 'square') {  
      wave_button.style('background-image', "url(square_icon.png)"); 
      curr_wave = 'saw';
      change_wave = 'saw';
      updateWaveType();  
    }
    else if (change_wave === 'saw') {
      wave_button.style('background-image', "url(saw_icon.png)"); 
      curr_wave = 'sine';
      change_wave = 'sine';
      updateWaveType(); 
    }
  }
}

function wave_drawing(){
  wavedraw_mode = !wavedraw_mode; 

  if (envelope_bool == true){
    envelope_bool == false; 
    draw_envelope_button.style('background-color', '#ffffff');
    
  }

  if (wavedraw_mode == true){
    draw_wave_button.style('background-color', '#4400ff');

  }
  else{
    draw_wave_button.style('background-color', '#ffffff');
  }

}

function envelope_drawing(){
  envelope_bool = !envelope_bool; 
  if (wavedraw_mode == true){
    draw_wave_button.style('background-color', '#ffffff');
    wavedraw_mode == false; 

  }

  if (envelope_bool == true){
    draw_envelope_button.style('background-color', '#4400ff');
  }
  else{
    draw_envelope_button.style('background-color', '#ffffff');
  }

}

function set_preset1(){


}

function set_preset2(){


}
///////////////////////////////////////////////////////////////////////////////

//Frequency Adjuster option
// function frequency_sliders() { 
//   frequency_bool = !frequency_bool;

//   if (frequency_bool == true) {
//     frequency_button.style('background-color', '#4400ff');
//     
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
//   }
  
// }

///////////////////////////////////////////////////////////////////////////////

//Keyboard function 
function access_keyboard(){
  keyboard_bool = !keyboard_bool; 

  if (keyboard_bool == true){
    keyboard_button.style('background-color', '#4400ff');

    recreateKeys();

    left_button = createDiv(" < "); 
    left_button.style("piano_button_style");
    left_button.mousePressed(keyboard_p5.move_left)

    right_button = createDiv(" > "); 
    right_button.style("piano_button_style"); 
    right_button.mousePressed(keyboard_p5.move_right);  

    keyboard_p5.resizeCanvas(windowWidth-200, windowHeight); 

  }
  else{
    keyboard_button.style('background-color', '#ffffff');

    clearKeys(); 

    keyboard_p5.clear(); 
    left_button.hide(); 
    right_button.hide(); 

    keyboard_p5.resizeCanvas(0, 0); 
  }
}

function clearKeys(){
  for (i =0; i<= keyNums; i++){
    white_keys[i].hide(); 
  }

  for (i=0; i<= sharp_flatNums +1; i++){
    black_keys[i].hide(); 
  }
}

function recreateKeys(){
  var whiteWidth = (windowWidth-200)/keyNums;
  var blackWidth = whiteWidth/2;
  for (i = 0; i<= keyNums; i++){ 
      //white keys
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
    }

  //black keys 
  fill(0,0,0); 
  for (i = 0; i<= sharp_flatNums+1; i++){
    black_keys[i] = createDiv(" "); 
    black_keys[i].class("piano_black_key_style")
    black_keys[i].style('width', blackWidth + "px");
    black_keys[i].mousePressed(playFlat(i));
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

      curr_recorded_sound = idx; 

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

function donePlaying(idx) {

  return function() {
    buttons[idx].html('Play sound '+idx);
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