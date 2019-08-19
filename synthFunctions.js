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
//    oscillators[i].amp( sliders[i].value() * output_slider.value() * synthGainFudgeFactor );
    oscillators[i].amp( slider_amps[i] * output_slider.value() * synthGainFudgeFactor );
  }
}

function updateSlider(idx) {
  return function() {
  
    if (sliders[idx].value() < minSliderRange + 1) {
      slider_amps[idx] = 0.0;
    }
    else {
    slider_amps[idx] = Math.pow(10, sliders[idx].value()/20); // dB to linear amplitude
  }
    
//    oscillators[idx].amp( sliders[idx].value() * output_slider.value() * synthGainFudgeFactor );
    oscillators[idx].amp( slider_amps[idx] * output_slider.value() * synthGainFudgeFactor );

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
  // For speed: Now this computes only enough of the wave to draw on the screen
  // ALSO: Does not apply envelope (just the synthesized wave)
  
  // Used to compute a full second (approximate, to the nearest full period) of synthesized wave,
  // multiplied by the amplitude envelope (if set). But this was very SLOW.

  period = round(44100/curr_f0);
  round_f0 = round(44100/period);
  
  // Compute how many values we need (to exceed a full second)
  //  synth_len = period * round_f0;

  if (synth_len < 44100) {
    synth_len += period;
  }

  // For speed: instead let's just compute enough samples to draw the wave on screen
  synth_len = 2*1024; // 2x because minimum waveScale is 2x

  
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
//      y_wave[i] += sliders[s].value() * sin(TWO_PI * (round_f0 * s) * x); 
      y_wave[i] += slider_amps[s] * sin(TWO_PI * (round_f0 * s) * x); 
    }
    
//    ye_wave[i] = y_wave[i] * e_wave[i];
    ye_wave[i] = y_wave[i];
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
//    oscillators[i].amp( sliders[i].value() * output_slider.value() );
    oscillators[i].amp( slider_amps[i] * output_slider.value() );
  }    
}

function updateWaveType(wave_type){

  if (wave_type == 'sine'){
    for (i = 1; i <= sliderNums; i++){
      if (i != 1){
        oscillators[i].amp(0); 
//        sliders[i].value(0); 
        sliders[i].value(minSliderRange);
        slider_amps[i] = 0.0;
      }
    }
  }
  else if (wave_type == 'square'){
    for (i = 1; i <= sliderNums; i++){
      if (i%2 == 0){
        oscillators[i].amp(0); 
//        sliders[i].value(0); 
        sliders[i].value(minSliderRange);
        slider_amps[i] = 0.0;
      }
      else{
        var inverse_num = 1/i; 
        oscillators[i].amp(inverse_num * output_slider.value() * synthGainFudgeFactor); 
//        sliders[i].value(inverse_num); 
        sliders[i].value(20 * Math.log10(inverse_num) );
        slider_amps[i] = inverse_num;
      } 
    }
  }
  else if (wave_type == 'saw'){
    for (i = 1; i<= sliderNums; i++){
      var inverse_num = 1/i;
      oscillators[i].amp(inverse_num * output_slider.value() * synthGainFudgeFactor); 
//      sliders[i].value(inverse_num);  
    sliders[i].value(20 * Math.log10(inverse_num) );
        slider_amps[i] = inverse_num;
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
//  envelope_mode = !envelope_mode; 
  //envelope_mode = true;
  
  if (wavedraw_mode){
    draw_wave_button.style('background-color', '#ffffff');
    wavedraw_mode = false; 
  }

  if (envelope_mode){
  envelope_mode = false; 
    draw_envelope_button.style('background-color', '#ffffff');
    
    recomputeWave();
    startOscillators(); 

  }
  else{
    envelope_mode = true;  
    draw_envelope_button.style('background-color', '#4400ff');
    stopOscillators();

  // If needed, intialize y_wave, e_wave, and ye_wave

//  if (synth_len < 44100) {
    synth_len = 44100;  // One second
    ye_wave = [];
    ye_wave = new Float32Array(synth_len);

/*    if (e_wave.length != synth_len) {
      e_wave = [];
      e_wave = new Float32Array(synth_len).fill(1.0);
    }
*/
    y_wave = [];
    y_wave = new Float32Array(synth_len).fill(0.0);
    
    for (i=0; i<synth_len; i++) {
      for (s=1; s<=sliderNums; s++) {
        x = i/44100;
//        y_wave[i] += sliders[s].value() * sin(TWO_PI * (round_f0 * s) * x); 
        y_wave[i] += slider_amps[s] * sin(TWO_PI * (round_f0 * s) * x); 
      }
  
      ye_wave[i] = y_wave[i] * e_wave[i];
    }

    ye_wave_idx = 0;
//  }  

    // Just in case synth is playing (it really shouldn't be)
    if (synth.isPlaying()) {
      synth.stop();
    }

    synth = new p5.SoundFile();     
    fft.setInput(synth);      
    synth.setBuffer( [ye_wave] );
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
    empty_preset1 = 1; //turns off saving slider values
    preset1_button.style('background-color', '#4400ff');

    if (empty_preset1 != 0){
      for (i=1; i<sliderNums; i++){
        sliders[i].value(preset1[i]);
        slider_amps[i] = Math.pow(10, preset1[i]/20);
  //      oscillators[i].amp(preset1[i] * output_slider.value() * synthGainFudgeFactor );
        if (sliders[i].value() == -60){
          oscillators[i].amp(0); 
        }
        else{
          oscillators[i].amp(slider_amps[i] * output_slider.value() * synthGainFudgeFactor );
        }
      }
      updatePresets(preset1);
      recomputeWave(); 
    } 
  }
  else{
    preset1_button.style('background-color', '#ffffff');
  }
}

function set_preset2(){
  preset2_bool = !preset2_bool
  if (preset2_bool == true){
    empty_preset2 = 1;// turns off saving slider values
    preset2_button.style('background-color', '#4400ff');

    for (i=1; i<sliderNums; i++){
      sliders[i].value(preset2[i]);
      sliders_amps[i] = Math.pow(10, preset2[i]/20);
//      oscillators[i].amp(preset2[i] * output_slider.value() * synthGainFudgeFactor );
      if (sliders[i].value() == -60){
        oscillators[i].amp(0); 
        }
      else{
        oscillators[i].amp(slider_amps[i] * output_slider.value() * synthGainFudgeFactor );
      }
    }
    updatePresets(preset2);
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
