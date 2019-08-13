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

    // frequency_button = createDiv("Frequency Adjuster"); 
    // frequency_button.class('subheader_style'); 
    // frequency_button.mousePressed(frequency_sliders); 
    // frequency_button.position(10, 130); 

    synthesis_button = createDiv("Synthesizer"); 
    synthesis_button.class('subheader_style'); 
    synthesis_button.mousePressed(synthesizer); 
    synthesis_button.position(header_x, 190);

    last_button = synthesis_button.y + synthesis_button.height; //y position where the synthesis button ends (for menu positioning)

    colour_button = createDiv("Colour Adjuster"); 
    colour_button.class('subheader_style'); 
    colour_button.mousePressed(colour_adjustment); 
    colour_button.position(header_x, windowHeight-40); 
    colour_button_pos = windowHeight-10-colour_button.height - 30;

    //Microphone Input's sliders, input box, and header (in between mic button and sound button) 
    input_header = createDiv('Input:'); 
    input_header.class('subheader_text_style'); 
    input_header.position(header_x-80, 95); 

    input_slider_input = createInput("1.0"); 
    input_slider_input.size(25); 
    input_slider_input.position(header_x, 118); 
    input_slider_input.input(input_change);
  //  input_slider_input.value(input_gain);

    mic_input_slider = createSlider(0,5,1,0); 
    mic_input_slider.size(140);
    mic_input_slider.position(header_x+40, 120); 
    mic_input_slider.style('background-color', string_colors);
    mic_input_slider.input(update_input_gain); 

    //MIC SECTION 
    mic_header = createDiv('Record and play back sound'); 
    mic_header.class('subheader_text_style'); 
    mic_header.position(header_x-10, last_button+ 30); 

    for (i=0; i<NumButtons; i++) {
      buttons[i] = createDiv('Record sound '+ (i+1));
      buttons[i].class('mic_style');
      buttons[i].mousePressed( toggleButton(i) );
      buttons[i].position(header_x,i*45 + last_button + 55);
      buttonState[i] = 0;
       
      // this sound file will be used to
      // playback & save the recording
      soundFile[i] = new p5.SoundFile();     
    }

    hide_micButtons(); //hiding everything because this is a menu and not on the main sidebar

    //SYNTHESIS SECTION 
    synthesis_header = createDiv('Synthesize your own sound'); 
    synthesis_header.class('subheader_text_style'); 
    synthesis_header.position(header_x-10, last_button + 27);

    keyboard_button = createDiv(" "); 
    keyboard_button.class("keyboard_style"); 
    keyboard_button.mousePressed(access_keyboard); 

    slider_button = createDiv(" "); 
    slider_button.class("slider_display_style"); 
    slider_button.style('background-color', '#4400ff');
    slider_button.mousePressed(show_sliders); 

    wave_button = createDiv(" "); 
    wave_button.class("waveType_style"); 
    wave_button.mousePressed(set_waveType('sine')); 

    draw_wave_button = createDiv("Draw Waveform"); 
    draw_wave_button.class("button_style"); 
    draw_wave_button.mousePressed(wave_drawing); 

    draw_envelope_button = createDiv("Draw Envelope"); 
    draw_envelope_button.class("button_style"); 
    draw_envelope_button.mousePressed(envelope_drawing); 

    preset1_button = createDiv("Preset 1"); 
    preset1_button.class("button_style"); 
    preset1_button.mousePressed(set_preset1); 

    preset2_button = createDiv("Preset 2"); 
    preset2_button.class("button_style"); 
    preset2_button.mousePressed(set_preset2);   

    ff1_header = createDiv('Fundamental Frequency:'); 
    ff1_header.class('subheader_text_style'); 

    output_header = createDiv('Output:'); 
    output_header.class('subheader_text_style'); 

    frequency_input = createInput(""); 
    frequency_input.size(25);  
    frequency_input.style("height", "20px"); 
    frequency_input.input(frequency_change); 
    frequency_input.value(curr_f0);

    overall_frequency_slider = createSlider(50,1000,curr_f0,0);
    overall_frequency_slider.size(140);  
    overall_frequency_slider.style('background-color', string_colors);
    overall_frequency_slider.input(update_f0); // set callback for value changes

    output_slider = createSlider(0,1,curr_output,0); 
    output_slider.size(140); 
    output_slider.style('background-color', string_colors);
    output_slider.input(update_output_gain);

    output_slider_input = createInput(""); 
    output_slider_input.size(25); 
    output_slider_input.value(curr_output); 
    output_slider_input.input(output_change);  

    synthesis_positions(); 

    hide_synthesis() //to ensure that everything is hidden initially 

    //COLOUR SECTION 
    colour_header = createDiv("Change line/background color"); 
    colour_header.class('subheader_text_style'); 
    colour_header.position(header_x-12, colour_button_pos - 240); 

    line_header = createDiv('Line Color'); 
    line_header.class('subheader_text_style'); 
    line_header.position(header_x-70, colour_button_pos - 210); 

    background_header = createDiv('Background Color'); 
    background_header.class('subheader_text_style'); 
    background_header.position(header_x-45, colour_button_pos - 90); 

    default_button = createButton("Default"); 
    default_button.position(header_x + 120, colour_button_pos - 215); 
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
    
  }

  p.draw = function() {
    p.fill(255,255,255); 
    p.textFont('Helvetica');
//    p.background(0,0,0); 

    var last_button = synthesis_button.y +synthesis_button.height/2; 

    //Headers
    p.textSize(33); 
    p.text('AudioWorks', header_x,35);

    sound_button = createDiv("Sound Recorder"); //sound menu button put here bc of odd selection issue where only right side can be pressed
    sound_button.class('subheader_style'); 
    sound_button.mousePressed(sound_recorder); 
    sound_button.position(header_x, 150); 

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

  //touch functionality for sidebar function 
  p.touchMoved = function(){
    updateColours(); 

    if (preset1_bool == true){
      updatePresets(preset1);
    }
    else if (preset2_bool == true){
      updatePresets(preset2); 
    }
  }
}