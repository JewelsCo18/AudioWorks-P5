
var keyboard_sketch = function(p){
	var cnv; 

	p.setup = function() {
		cnv = p.createCanvas(0, 0);
		cnv.position(200,0);

		//triangle oscillator that will play "notes" of the keyboard
		note = new p5.TriOsc(); 
		note.start(); 
		note.amp(0);

	}

	p.draw = function(){
		if (keyboard_bool == true){
			p.loop(); 
			p.clear(); 

			move_box.position(230, move_y);
			move_box.style("background-color", "#4400ff")
			left_button.position((windowWidth/3.3), move_y+7); 
			right_button.position((windowWidth/1.15), move_y+7);

			//white keys
			for (i = 0; i<= keyNums; i++){ 
				p.fill(230,230,230); 
				var label;
				//this will dictate when a label should be placed i.e. when it is a new octave
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

				if (i == 0 || i == 2 || i == 5 || i == 9 || i == 12 || i == 16){
				}
				else{
					black_keys[i].position(white_key_pos - 20 , move_y+43)
				}
				
				white_keys[i].position(white_key_pos, move_y+43) 
				white_key_pos += ((windowWidth-200)/keyNums)-4.5;

			}
			white_key_pos = 230; //have to redefine the x position of the white key for if the keyboard is redrawn 
		}
	}

	p.move_left = function(){
		//adjusting octave to go down 
		if (octave_start >= 1){
			octave_start -= 1; 
			curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; 
			p.clear();
			clearKeys(); 
			recreateKeys(); //will update the keys with the correct labels and note frequency
		}
	}

	p.move_right = function(){
		//adjusting octave to go up 
		if (octave_start <= 5){
			octave_start += 1; 
			curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; 
			p.clear(); 
			clearKeys(); 
			recreateKeys(); //will update the keys with the correct labels and note frequency
		}
	}

	//touch functionality for keyboard canvas
	p.touchStarted = function(){
		initial_x = p.mouseX; 
		initial_y = p.mouseY;
		if (230<= initial_x && initial_x <= windowWidth && move_y <= initial_y && initial_y <= move_y + 90){
			moveable = true; 
		} 
	}

	p.touchMoved = function(){
		if (moveable == true){
			p.loop(); 
			move_y = p.mouseY;  
		}
	} 

	p.touchEnded = function(){
		moveable = false; 
	}			 
}

function playNote(num){ //play white key

	return function() {

		extra = num; 
		for (i = 0; i< num; i++){
			if (i == 1 || i == 4 || i == 8 || i == 11 || i == 15|| i == 18 || i == 21 ){ //no flats in between
				//print("continue")
				continue;
			}
			else{ //a flat appeared 
				//print("extra");
				extra += 1; 
			}
		}

		steps = (octave_start * 12) + extra; //calculating how many half steps for frequency equation 

		new_frequency = start_A * pow(2, steps/12) //frequency equation
		//print("white", new_frequency, num);
		note.freq(new_frequency); 
		note.amp(output_slider.value());
		note.fade(0.5,0.2); //fade in the note

		setTimeout(function() {
		    note.fade(0,0.5);
		},100);//fade out the note after 100 milliseconds
	}
}

function playFlat(num){ //play black key 

	return function() {

		extra = -2; 
		for (i = 0; i <= num; i++){
			if ( i % 2 == 0 || i == 7 || i== 11|| i == 14 || i == 15){ //two whites between 
				extra += 2; 
			}
			else{
				extra += 1; 
			}
		}

		steps = (octave_start * 12) + extra; //calculating how many half steps for frequency equation 

		new_frequency = start_A * pow(2, steps/12) //frequency equation
		print("flat", new_frequency, 'N'+num, 'E'+extra);
		note.freq(new_frequency);
		note.amp(output_slider.value());  
		note.fade(0.5,0.2); //fade in the note

		setTimeout(function() {
		    note.fade(0,0.5);
		},100); //fade out the note after 100 milliseconds
	}
}






