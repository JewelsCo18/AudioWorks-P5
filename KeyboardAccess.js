
var keyboard_sketch = function(p){
	var cnv; 

	p.setup = function() {
		cnv = p.createCanvas(0, 0);
		cnv.position(0,0);

		note = new p5.TriOsc(); 
		note.start(); 
		note.amp(0);

	}

	p.draw = function(){
		if (keyboard_bool == true){
			p.loop(); 
			p.clear(); 

			p.fill(68,0,255);
			p.rect(230,move_y,windowWidth - 200, 50);

			left_button.position((windowWidth/3.5), move_y+7);  //FIX THIS 
			right_button.position((windowWidth/1.05), move_y+7); //FIX THIS 

			for (i = 0; i<= keyNums; i++){ 
				//white keys
				p.fill(230,230,230); 
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
				white_keys[i].position(white_key_pos, move_y+43) 
				white_key_pos += ((windowWidth-200)/keyNums)-4.5;
			}
			white_key_pos = 230; 

			var counter = 0; 
			var space = (((windowWidth - 200)/keyNums)-1)/1.5;
			for (i = 0; i<= sharp_flatNums+1; i++){
				counter += 1; 
				black_keys[i].position(black_key_pos, move_y+43)

				if (counter == 1 || counter == 3) {
					black_key_pos += space * 3;
				}
				else if (counter == 5){
					counter = 0; 
					black_key_pos += space * 1.25; 
				}
				else{
					black_key_pos += space * 1.25; 
				}
			}
			black_key_pos = 255; 
		}
		else{
			p.noLoop(); 
		}
	}

	p.move_left = function(){
		//adjusting octave to go down 
		if (octave_start >= 1){
			octave_start -= 1; 
			curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; 
			p.clear();
			clearKeys(); 
			recreateKeys(); 
		}
	}

	p.move_right = function(){
		//adjusting octave to go up 
		if (octave_start <= 5){
			octave_start += 1; 
			curr_octaves = ['A' + octave_start, 'A' + (octave_start+1), 'A' + (octave_start+2)]; 
			p.clear(); 
			clearKeys(); 
			recreateKeys(); 
		}
	}

	p.mousePressed = function(){
		initial_x = p.mouseX; 
		initial_y = p.mouseY; 
	}

	p.mouseDragged = function(){ //WONT GO UP FOR SOME REASON!!!
		if (230<= initial_x && initial_x <= windowWidth && move_y <= initial_y && initial_y <= move_y + 90){
			p.loop(); 
			move_y = p.mouseY;  
		}
	} 			 
}

function playNote(num){

	return function() {

		start_A = 27.5 //Hz for A0
		extra = num; 
		for (i = 0; i< num; i++){
			if (i == 1 || i == 4 || i == 8 || i == 11 || i == 18 || i == 21 ){ //no flats in betwen
				//print("continue")
				continue;
			}
			else{ //a flat appeared 
				//print("extra");
				extra += 1; 
			}
		}

		steps = (octave_start * 13) - (octave_start) + extra; //calculating how many half steps for frequency equation 

		new_frequency = start_A * pow(2, steps/12) //frequency equation
		//print("white", new_frequency);
		note.freq(new_frequency); 
		note.fade(0.5,0.2); 

		setTimeout(function() {
		    note.fade(0,0.5);
		},75);
	}
}

function playFlat(num){

	return function() {

		start_A = 27.5 //Hz for A0
		extra = num; 
		for (i = 0; i <= num; i++){
			if (i == 1 || i == 3 || i == 6 || i == 8 || i == 11){ //two whites between
				//print("+2"); 
				extra += 2; 
			}
			else{ //one white in between
				//print("+1");
				extra += 1; 
			}
		}

		steps = (octave_start * 13) - (octave_start) + extra; //calculating how many half steps for frequency equation 

		new_frequency = start_A * pow(2, steps/12) //frequency equation
		//print("flat", new_frequency);
		note.freq(new_frequency); 
		note.fade(0.5,0.2); 

		setTimeout(function() {
		    note.fade(0,0.5);
		},75);
	}
}






