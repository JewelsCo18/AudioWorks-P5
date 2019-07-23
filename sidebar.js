////////////////////////////////////////////////////////////////////////////////
// Isolated setup for sidebar controls
// Moved this closure to a separate file, sidebar.js
////////////////////////////////////////////////////////////////////////////////


//Where all descriptions and text go
var side_bar = function(p) { 

  p.setup = function() {
    var side_cnv = p.createCanvas(220, 800); 
    side_cnv.position(0,0);
    p.noLoop();

    micButton = createDiv('Mic ON');
    micButton.class('button_style');
    micButton.mousePressed(restartMic);
    micButton.position(10, 50); 

    sound_button = createDiv("Sound Recorder"); 
    sound_button.class('button_style'); 
    sound_button.mousePressed(sound_recorder); 
    sound_button.position(10, 90); 

    frequency_button = createDiv("Frequency Adjuster"); 
    frequency_button.class('button_style'); 
    frequency_button.mousePressed(frequency_sliders); 
    frequency_button.position(10, 130); 

    colour_button = createDiv("Colour Adjuster"); 
    colour_button.class('button_style'); 
    colour_button.mousePressed(colour_adjustment); 
    colour_button.position(10, 170); 

    synthesis_button = createDiv("Synthesizer"); 
    synthesis_button.class('button_style'); 
    synthesis_button.mousePressed(synthesizer); 
    synthesis_button.position(10, 210); 
    
  }

  p.draw = function() {
    p.fill(255,255,255); 
    p.textFont('Baskerville');
    var last_button = synthesis_button.y +synthesis_button.height/2; 

    //Headers
    p.textSize(36); 
    p.text('AudioWorks', header_x,35);

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
      p.text("Change the line/background color", header_x, last_button + 45); 

      //colour slider descriptions
      p.text("Line Color", header_x, last_button + 65); 
      p.text("Red", descriptor_x, last_button + 80); 
      p.text("Green", descriptor_x, last_button + 110); 
      p.text("Blue", descriptor_x, last_button + 140); 

      p.text("Background Color", header_x, last_button + 180); 
      p.text("Red", descriptor_x, last_button + 200); 
      p.text("Green", descriptor_x, last_button + 230); 
      p.text("Blue", descriptor_x, last_button + 260); 
    }
    
    if (synthesis_bool == true) { 
      p.text("Synthesize your own sound", header_x, last_button + 45); 
    }

  }

}
