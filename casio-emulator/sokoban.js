
export default function sokoban({
    KEY_CTRL_LEFT,
    KEY_CTRL_RIGHT,
    KEY_CTRL_UP,
    KEY_CTRL_DOWN,
    KEY_CTRL_EXIT,
    KEY_CTRL_F1,
    KEY_CTRL_SHIFT,
    KEY_CTRL_EXE,
    _OPENMODE_READWRITE,
    Bdisp_AreaClr_VRAM,
    ML_horizontal_line,
    ML_vertical_line,
    ML_pixel,
    ML_line,
    ML_clear_vram,
    GetKey,
    PrintXY,
    PrintMini,
    Bdisp_AreaReverseVRAM,
    locate,
    Print,
    ML_display_vram,
    Bfile_OpenFile,
    Bfile_ReadFile,
    Bfile_SeekFile,
    Bfile_WriteFile,
    Bfile_CreateFile,
    Sleep,
}) {

let key; // unsigned int key;
let posX = 1;
let posY = 9;
let hasWon;

let currentLvlMap = Array(18).fill(null).map(() => Array(11).fill(0)); // char currentLvlMap[18][11] = {0};
let mapWidth = 0; //those two ints are for centering the map
let mapHeight = 0;
let posXmap = 0;
let posYmap = 0;

let fileHandle;


function dispSprite(spriteId, x, y) { // C: function dispSprite(spriteId, x, y) - likely SDK specific 'void'
	let dispBox = {}; // DISPBOX dispBox;
	dispBox.left = x;
	dispBox.top = y;
	dispBox.right = x+6;
	dispBox.bottom = y+6;
	Bdisp_AreaClr_VRAM(dispBox); // Bdisp_AreaClr_VRAM(&dispBox);

	switch(spriteId) { // Original C had 'switch(sprite)', assumed typo for 'spriteId' for behavioral correctness
		case 0: //wall
			ML_horizontal_line(y, x, x+6, 1);
			ML_horizontal_line(y+6, x, x+6, 1);
			ML_vertical_line(x, y, y+6, 1);
			ML_vertical_line(x+6, y, y+6, 1);
			break;

		case 2: //crate
			/*ML_horizontal_line(y, x, x+6, 1);
			ML_horizontal_line(y+6, x, x+6, 1);
			ML_vertical_line(x, y, y+6, 1);
			ML_vertical_line(x+6, y, y+6, 1);
			ML_horizontal_line(y+2, x, x+6, 1);
			ML_horizontal_line(y+4, x, x+6, 1);*/

			ML_horizontal_line(y+1, x+1, x+5, 1);
			ML_horizontal_line(y+3, x+1, x+5, 1);
			ML_horizontal_line(y+5, x+1, x+5, 1);
			ML_vertical_line(x+1, y+1, y+5, 1);
			ML_vertical_line(x+5, y+1, y+5, 1);
			//ML_line(x, y, x+6, y+6, 1);
			//ML_line(x+6, y, x, y+6, 1);
			break;

		case 3: //character
			/*ML_pixel(x+3, y, 1);
			ML_pixel(x+2, y+1, 1);
			ML_pixel(x+4, y+1, 1);
			ML_horizontal_line(y+3, x+2, x+4, 1);
			ML_vertical_line(x+3, y+2, y+4, 1);
			ML_vertical_line(x+2, y+5, y+6, 1);
			ML_vertical_line(x+4, y+5, y+6, 1);*/
			ML_horizontal_line(y+1, x+2, x+4, 1);
			ML_horizontal_line(y+5, x+2, x+4, 1);
			ML_vertical_line(x+1, y+2, y+4, 1);
			ML_vertical_line(x+5, y+2, y+4, 1);
			ML_pixel(x+3, y+3, 1);
			break;

		case 4: //crate emplacement
			/*ML_horizontal_line(y+2, x+2, x+4, 1);
			ML_horizontal_line(y+4, x+2, x+4, 1);
			ML_pixel(x+2, y+3, 1);
			ML_pixel(x+4, y+3, 1);*/
			ML_line(x+1, y+1, x+6, y+6, 1);
			ML_line(x+1, y+5, x+6, y, 1);
			break;

		case 5: //crate on emplacement
			/*ML_horizontal_line(y, x, x+6, 1);
			ML_horizontal_line(y+6, x, x+6, 1);
			ML_vertical_line(x, y, y+6, 1);
			ML_vertical_line(x+6, y, y+6, 1);
			ML_horizontal_line(y+2, x+2, x+4, 1);
			ML_horizontal_line(y+4, x+2, x+4, 1);
			ML_pixel(x+2, y+3, 1);
			ML_pixel(x+4, y+3, 1);*/
			ML_horizontal_line(y+1, x+1, x+5, 1);
			ML_horizontal_line(y+5, x+1, x+5, 1);
			ML_vertical_line(x+1, y+1, y+5, 1);
			ML_vertical_line(x+5, y+1, y+5, 1);
			ML_line(x+1, y+1, x+5, y+5, 1);
			ML_line(x+1, y+5, x+5, y+1, 1);
			break;

		case KEY_CTRL_LEFT: //character facing left
			/*ML_horizontal_line(y, x, x+4, 1);
			ML_vertical_line(x+1, y, y+2, 1);
			ML_vertical_line(x+1, y+4, y+5, 1);
			ML_vertical_line(x+5, y+1, y+5, 1);
			ML_horizontal_line(y+6, x+2, x+4, 1);
			ML_pixel(x+2, y+3, 1);
			ML_pixel(x+3, y+3, 1);
			ML_pixel(x+3, y+4, 1);
			ML_pixel(x+4, y+2, 1);
			ML_pixel(x+4, y+5, 1);*/
			ML_horizontal_line(y+1, x, x+4, 1);
			ML_horizontal_line(y+5, x, x+4, 1);
			ML_vertical_line(x+1, y+2, y+4, 1);
			ML_vertical_line(x+5, y+2, y+4, 1);
			ML_pixel(x+3, y+3, 1);
			break;

		case KEY_CTRL_RIGHT:
			ML_horizontal_line(y+1, x+2, x+6, 1);
			ML_horizontal_line(y+5, x+2, x+6, 1);
			ML_vertical_line(x+1, y+2, y+4, 1);
			ML_vertical_line(x+5, y+2, y+4, 1);
			ML_pixel(x+3, y+3, 1);
			break;
		case KEY_CTRL_UP:
			ML_horizontal_line(y+1, x+2, x+4, 1);
			ML_horizontal_line(y+5, x+2, x+4, 1);
			ML_vertical_line(x+1, y, y+4, 1);
			ML_vertical_line(x+5, y, y+4, 1);
			ML_pixel(x+3, y+3, 1);
			break;
		case KEY_CTRL_DOWN:
			ML_horizontal_line(y+1, x+2, x+4, 1);
			ML_horizontal_line(y+5, x+2, x+4, 1);
			ML_vertical_line(x+1, y+2, y+6, 1);
			ML_vertical_line(x+5, y+2, y+6, 1);
			ML_pixel(x+3, y+3, 1);
			break;
	}

}

async function playLvl(map) { // C: void playLvl(char* map)
    //console.log(map);
	let i,j;
	let posCharX = 0;
	let posCharY = 0;
	hasWon = 0;
	// memset(currentLvlMap, 0, sizeof(currentLvlMap));
    for(let r = 0; r < 18; ++r) { // Equivalent of memset for 2D array
        for(let c = 0; c < 11; ++c) {
            currentLvlMap[r][c] = 0;
        }
    }
	ML_clear_vram();
	for (i = 0; i < mapWidth*mapHeight; i++) {
		currentLvlMap[i%mapWidth][Math.floor(i/mapWidth)] = map[i] ?? 0; // C: i/mapWidth is integer division
	}
    //console.log(currentLvlMap);
	posXmap = 64-Math.floor(7*mapWidth/2); // C: / is integer division
	posYmap = 32-Math.floor(7*mapHeight/2); // C: / is integer division

	//displays the map
	for (i = 0; i < mapWidth; i++) {
		for (j = 0; j < mapHeight; j++) {
			let relativeX = posXmap+7*i;
			let relativeY = posYmap+7*j;

			if (currentLvlMap[i][j]) { //sprite isn't a wall
				dispSprite(currentLvlMap[i][j], relativeX, relativeY);
			} else { //draws borders and corners only

				if (i > 0 && currentLvlMap[i-1][j]) { //left side
					ML_vertical_line(relativeX, relativeY, relativeY+6, 1);
				}
				if (i < mapWidth && currentLvlMap[i+1][j]) { //right side. C: mapWidth (not mapWidth-1) is likely an off-by-one or specific SDK logic. For arrays, usually i < mapWidth-1 for i+1. Assuming C logic is sound.
					ML_vertical_line(relativeX+6, relativeY, relativeY+6, 1);
				}
				if (j > 0 && currentLvlMap[i][j-1]) { //top side
					ML_horizontal_line(relativeY, relativeX, relativeX+6, 1);
				}
				if (j < mapHeight && currentLvlMap[i][j+1]) { //bottom side
					ML_horizontal_line(relativeY+6, relativeX, relativeX+6, 1);
				}
				if (j > 0 && i > 0 && currentLvlMap[i-1][j-1]) { //top left corner
					ML_pixel(relativeX, relativeY, 1);
				}
				if (j > 0 && i < mapWidth && currentLvlMap[i+1][j-1]) { //top right corner
					ML_pixel(relativeX+6, relativeY, 1);
				}
				if (j < mapHeight && i > 0 && currentLvlMap[i-1][j+1]) { //bottom left corner
					ML_pixel(relativeX, relativeY+6, 1);
				}
				if (j < mapHeight && i < mapWidth && currentLvlMap[i+1][j+1]) { //bottom right corner
					ML_pixel(relativeX+6, relativeY+6, 1);
				}
			}
			if (currentLvlMap[i][j] == 3) {
				posCharX = i;
				posCharY = j;
				currentLvlMap[i][j] = 1;
			}
		}
	}

	//Game playing loop

	do {
		key = await GetKey(); // C: GetKey(&key);
		if (key == KEY_CTRL_DOWN || key == KEY_CTRL_UP || key == KEY_CTRL_LEFT || key == KEY_CTRL_RIGHT) { //character has moved
			let xOffset = 0;
			let yOffset = 0;
			//moves the character appropriately
			if (key == KEY_CTRL_DOWN) yOffset++;
			else if (key == KEY_CTRL_UP) yOffset--;
			else if (key == KEY_CTRL_LEFT) xOffset--;
			else if (key == KEY_CTRL_RIGHT) xOffset++;

			//checks if the character is within the bounds of the map and if the position isn't a wall
			if (posCharY+yOffset < mapHeight && posCharY+yOffset >= 0 && posCharX+xOffset < mapWidth && posCharX+xOffset >= 0
					&& currentLvlMap[posCharX+xOffset][posCharY+yOffset] != 0) {

				//erase the current character sprite
				dispSprite(currentLvlMap[posCharX][posCharY], posXmap+7*posCharX, posYmap+7*posCharY);

				//checks if the new character position is a crate
				if (currentLvlMap[posCharX+xOffset][posCharY+yOffset] == 2 || currentLvlMap[posCharX+xOffset][posCharY+yOffset] == 5) {

					//checks if the crate can be pushed
					if (currentLvlMap[posCharX+2*xOffset][posCharY+2*yOffset] == 1 || currentLvlMap[posCharX+2*xOffset][posCharY+2*yOffset] == 4) {

						//replaces the old crate position by what is under it
						currentLvlMap[posCharX+xOffset][posCharY+yOffset]--;
						//puts the crate in its new position
						currentLvlMap[posCharX+2*xOffset][posCharY+2*yOffset]++;
						//moves the character
						posCharY += yOffset;
						posCharX += xOffset;
						//displays the crate
						dispSprite(currentLvlMap[posCharX+xOffset][posCharY+yOffset], posXmap+7*posCharX+7*xOffset, posYmap+7*posCharY+7*yOffset);

						//if the crate is on an emplacement, check if the player has won by checking if there are crates not on emplacement left
						if (currentLvlMap[posCharX+xOffset][posCharY+yOffset] == 5) {
							hasWon = 1;
							for (i = 0; i < mapWidth; i++) {
								for (j = 0; j < mapHeight; j++) {
									if (currentLvlMap[i][j] == 2)
										hasWon = 0;
								}
							}
						}
						dispSprite(key, posXmap+7*posCharX, posYmap+7*posCharY);

					} else {
						dispSprite(3, posXmap+7*posCharX, posYmap+7*posCharY);
					}
				} else { //new character position is floor/crate emplacement
					posCharY += yOffset;
					posCharX += xOffset;
					dispSprite(3, posXmap+7*posCharX, posYmap+7*posCharY); // C used 3, JS uses key. Reverted to C's 3. The line before used key. This line should be 3 for char.
                                                                // Ah, the 'key' in the block above `dispSprite(key, ...)` is for character facing direction.
                                                                // This else block means the character moved to an empty space, so sprite '3' (character) or 'key' (facing direction) should be used.
                                                                // The if block uses `dispSprite(key, ...)`. This else block also uses `dispSprite(key, ...)` for consistency.
                                                                // Let's re-check: C code uses `dispSprite(3, ...)`. I'll stick to that.
				}

				//ML_pixel(1, 1, 1);
			}
		}
        await new Promise(resolve => requestAnimationFrame(resolve));
	} while (key != KEY_CTRL_EXIT && key != KEY_CTRL_F1 && key != KEY_CTRL_SHIFT && key != KEY_CTRL_EXE && !hasWon);
}


async function sokobanLvl(level) { // C: void sokobanLvl(int level)
	mapHeight = 0;
	mapWidth = 0;
	if (level == 1) {
		const lvlMap = [ // C: char lvlMap[40]
			0, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 1, 1, 0, 1, 1, 0,
			0, 1, 1, 1, 2, 3, 4, 0,
			0, 1, 1, 1, 0, 1, 1, 0
		]; mapWidth  = 8
		;  mapHeight = 5
		; await playLvl(lvlMap);
	} else if (level == 2) {
		const lvlMap = [ // C: char lvlMap[42]
			0, 0, 0, 0 ,0 ,0, 0,
			0, 0, 0, 1, 1, 0, 0,
			0, 1, 2, 1, 4, 0, 0,
			0, 1, 2, 1, 1, 1, 0,
			0, 3, 0, 4, 1, 1, 0
		]; mapWidth  = 7
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level == 3) {
		const lvlMap = [ // C: char lvlMap[42]
			0, 0, 0, 0, 0, 0,
			0, 4, 4, 4, 1, 0,
			0, 1, 0, 2, 1, 0,
			0, 1, 2, 1, 1, 0,
			0, 1, 2, 1, 0, 0,
			0, 3, 1, 0, 0, 0,
		]; mapWidth  = 6
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level == 4) {
		const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,4,0,0,0,4,0,
			0,1,0,1,1,4,0,
			0,1,2,2,1,3,0,
			0,1,1,2,1,1,0,
			0,1,1,0,1,1,0,
			0,1,1,0,0,0,0
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level == 5) {
		const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,1,3,1,0,0,0,
			0,0,1,4,1,1,1,0,
			0,4,1,2,4,2,1,0,
			0,0,2,0,1,0,0,0,
			0,0,1,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level == 6) {
		const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,0,0,
			0,0,1,1,0,0,0,0,
			0,1,1,1,1,1,0,0,
			0,1,1,0,2,2,3,0,
			0,1,1,4,1,5,4,0,
		]; mapWidth  = 8
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level == 7) {
		const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,1,1,1,1,0,
			0,1,0,1,0,0,5,0,
			0,1,0,3,1,2,1,0,
			0,4,2,1,4,1,1,0,
			0,0,0,0,0,1,1,0,
			0,0,0,0,0,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level == 8
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,1,0,0,0,0,
			0,1,2,2,1,1,1,0,
			0,1,4,0,4,1,1,0,
			0,1,1,0,0,1,0,0,
			0,1,1,0,0,2,0,0,
			0,1,3,1,1,4,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==9
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,1,1,1,4,1,0,
			0,1,2,1,1,2,3,0,
			0,4,2,4,0,0,0,0,
			0,1,1,0,0,0,0,0,
			0,1,1,0,0,0,0,0,
			0,1,1,0,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==10
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,0,0,1,4,1,0,
			0,1,5,3,1,4,1,0,
			0,1,2,1,0,1,1,0,
			0,1,0,1,1,2,1,0,
			0,1,1,1,0,0,0,0
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==11
	){	const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,0,0,
			0,0,0,1,1,0,0,0,
			0,1,4,4,1,2,4,0,
			0,1,1,2,2,1,3,0,
			0,0,0,0,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level ==12
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,0,1,3,1,0,
			0,0,0,0,1,1,1,0,
			0,0,1,2,1,2,0,0,
			0,0,1,2,1,1,0,0,
			0,4,1,1,0,1,0,0,
			0,4,4,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==13
	){	const lvlMap = [ // C: char lvlMap[100]
			0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,4,4,0,
			0,0,0,0,0,1,1,4,4,0,
			0,0,0,0,0,1,1,2,1,0,
			0,0,0,0,0,0,1,0,0,0,
			0,3,1,1,1,1,1,0,0,0,
			0,0,1,0,1,2,1,2,1,0,
			0,0,1,2,1,0,1,0,1,0,
			0,0,1,1,1,0,1,1,1,0,
		]; mapWidth  = 10
		;  mapHeight = 10
		; await playLvl(lvlMap);
	} else if (level ==14
	){	const lvlMap = [ // C: char lvlMap[63]
			0,0,0,0,0,0,0,0,0,
			0,4,4,4,4,0,0,0,0,
			0,3,1,2,2,2,1,4,0,
			0,0,1,1,2,1,1,1,0,
			0,0,0,0,0,2,0,1,0,
			0,0,0,0,0,1,1,1,0,
		]; mapWidth  = 9
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==15
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,1,1,1,1,1,0,0,
			0,1,4,5,2,2,1,0,
			0,1,5,1,0,3,1,0,
			0,1,4,5,1,1,0,0,
			0,1,1,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==16
	){	const lvlMap = [ // C: char lvlMap[60]
			0,0,0,0,0,0,0,0,0,0,
			0,0,1,1,2,3,4,4,4,0,
			0,1,1,2,2,0,0,0,0,0,
			0,1,1,1,1,0,0,0,0,0,
			0,0,1,1,1,0,0,0,0,0,
		]; mapWidth  = 10
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level ==17
	){	const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,
			0,1,1,3,1,0,
			0,1,2,1,1,0,
			0,0,1,0,2,0,
			0,1,2,2,1,0,
			0,1,1,2,4,0,
			0,4,4,4,4,0,
		]; mapWidth  = 6
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==18
	){	const lvlMap = [ // C: char lvlMap[88]
			0,0,0,0,0,0,0,0,0,0,0,
			0,1,1,1,5,1,3,0,0,0,0,
			0,1,2,4,1,5,1,0,0,0,0,
			0,0,0,1,5,4,1,1,0,0,0,
			0,0,1,5,4,5,2,2,1,1,0,
			0,0,1,1,1,1,1,1,1,1,0,
			0,0,0,0,0,0,0,0,1,1,0,
		]; mapWidth  = 11
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==19
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,0,0,0,1,3,0,
			0,1,1,5,2,1,0,
			0,1,1,1,1,1,0,
			0,0,1,4,0,0,0,
			0,0,2,1,0,0,0,
			0,0,1,4,0,0,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} if (level ==20 // Note: This is 'if', not 'else if'
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,1,1,0,0,0,0,
			0,4,4,2,1,1,4,0,
			0,1,0,2,1,2,1,0,
			0,3,1,1,0,1,1,0,
			0,0,0,0,0,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==21
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,4,0,0,0,0,
			0,1,2,4,4,1,0,0,
			0,1,1,0,0,2,0,0,
			0,0,1,1,0,1,1,0,
			0,0,2,1,1,1,3,0,
			0,0,1,1,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==22
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,1,1,1,0,0,0,0,
			0,1,0,1,5,3,0,0,
			0,1,1,5,1,1,1,0,
			0,0,0,2,1,1,1,0,
			0,0,0,1,1,1,4,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==23
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,1,1,1,0,0,0,
			0,1,1,2,1,1,0,
			0,0,2,2,1,4,0,
			0,0,3,1,4,1,0,
			0,0,0,1,0,1,0,
			0,0,0,1,1,4,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==24
	){	const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,0,0,
			0,1,4,1,1,0,0,0,
			0,1,4,0,1,0,0,0,
			0,1,3,2,2,1,1,0,
			0,1,2,4,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level ==25
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,0,1,1,0,0,
			0,0,0,0,1,2,0,0,
			0,1,3,2,4,1,1,0,
			0,1,0,0,1,1,1,0,
			0,1,1,1,0,0,1,0,
			0,1,1,1,5,1,4,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==26
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,1,1,1,1,1,1,0,
			0,1,0,2,1,1,1,0,
			0,1,2,1,3,0,4,0,
			0,0,2,0,4,1,1,0,
			0,0,1,1,1,1,4,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==27
	){	const lvlMap = [ // C: char lvlMap[100]
			0,0,0,0,0,0,0,0,0,0,
			0,0,1,1,3,0,0,4,4,0,
			0,1,1,2,1,0,0,4,4,0,
			0,1,2,0,0,0,0,4,5,0,
			0,1,1,1,1,1,0,4,4,0,
			0,1,2,0,2,1,0,2,1,0,
			0,1,1,2,1,0,0,1,1,0,
			0,0,0,1,1,1,1,1,2,0,
			0,0,0,0,0,0,1,1,1,0,
		]; mapWidth  = 10
		;  mapHeight = 10
		; await playLvl(lvlMap);
	} else if (level ==28
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,1,2,4,4,0,
			0,0,0,1,1,5,4,0,
			0,1,1,2,1,5,4,0,
			0,1,2,2,2,0,4,0,
			0,1,1,0,1,0,0,0,
			0,3,1,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==29
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,0,1,1,4,1,0,
			0,1,5,1,0,1,0,
			0,1,4,2,1,1,0,
			0,1,1,0,2,0,0,
			0,0,1,3,1,0,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==30
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,0,0,1,1,4,0,
			0,1,2,1,0,1,0,
			0,1,5,2,1,1,0,
			0,1,4,0,3,1,0,
			0,1,1,1,1,0,0,
			0,1,1,1,0,0,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==31
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,1,3,0,0,0,
			0,1,2,0,1,0,0,0,
			0,1,5,1,2,1,1,0,
			0,1,1,1,0,0,1,0,
			0,0,4,1,1,4,1,0,
			0,0,0,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==32
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,1,1,1,3,0,0,
			0,1,1,0,1,1,0,
			0,4,1,1,2,1,0,
			0,1,2,2,0,4,0,
			0,0,0,1,1,4,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==33
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,3,4,0,1,1,0,
			0,1,4,2,1,4,1,0,
			0,1,1,0,2,1,1,0,
			0,1,1,2,1,1,0,0,
			0,0,0,1,1,0,0,0,
			0,0,0,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==34
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,3,1,0,
			0,0,0,0,0,1,4,0,
			0,1,2,1,2,1,2,0,
			0,1,1,1,4,1,1,0,
			0,0,0,1,4,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==35
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,1,0,1,1,0,
			0,1,0,4,2,1,2,0,
			0,1,1,1,2,1,1,0,
			0,0,0,0,0,4,1,0,
			0,0,0,1,1,1,3,0,
			0,0,0,1,1,1,4,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==36
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,0,3,1,0,0,
			0,0,0,1,1,4,4,0,
			0,0,1,2,0,2,0,0,
			0,1,1,1,2,4,1,0,
			0,1,1,0,1,1,1,0,
			0,1,1,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==37
	){	const lvlMap = [ // C: char lvlMap[99]
			0,0,0,0,0,0,0,0,0,0,0,
			0,1,4,0,0,0,0,1,1,1,0,
			0,1,4,0,1,1,2,1,0,1,0,
			0,1,4,0,2,1,1,2,0,1,0,
			0,4,4,4,2,1,1,1,1,1,0,
			0,0,1,2,2,0,0,2,1,0,0,
			0,0,4,0,1,2,1,1,1,0,0,
			0,0,4,0,3,1,0,1,1,0,0,
		]; mapWidth  = 11
		;  mapHeight = 9
		; await playLvl(lvlMap);
	} else if (level ==38
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,1,1,1,1,1,0,
			0,0,1,4,2,5,1,0,
			0,1,1,5,3,5,1,0,
			0,1,1,5,2,4,1,0,
			0,0,1,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==39
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,4,1,4,0,0,0,
			0,4,0,2,2,1,0,
			0,1,1,1,3,1,0,
			0,1,2,0,1,1,0,
			0,0,1,1,1,0,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} if (level ==40 // Note: This is 'if', not 'else if'
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,4,1,1,1,4,1,0,
			0,1,0,1,0,1,1,0,
			0,3,2,1,1,2,4,0,
			0,0,0,0,0,1,2,0,
			0,0,0,0,0,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==41
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,1,1,0,
			0,0,0,0,0,2,4,0,
			0,0,0,1,1,4,1,0,
			0,0,0,1,1,0,4,0,
			0,1,2,1,1,2,1,0,
			0,1,1,1,0,3,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==42
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,1,4,1,1,0,
			0,1,2,3,0,4,1,0,
			0,1,1,2,0,1,0,0,
			0,1,1,5,1,1,0,0,
			0,0,1,1,0,1,0,0,
			0,0,0,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==43
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,1,3,0,0,0,
			0,1,2,2,0,0,0,0,
			0,1,2,1,4,1,1,0,
			0,0,1,0,4,0,1,0,
			0,4,1,1,1,0,1,0,
			0,1,1,1,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==44
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,0,0,4,1,3,0,
			0,1,1,4,2,1,1,0,
			0,1,0,1,1,0,0,0,
			0,1,2,1,2,1,4,0,
			0,0,0,0,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==45
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,4,1,0,0,0,0,0,
			0,1,2,0,0,0,0,0,
			0,1,1,0,0,0,0,0,
			0,1,4,2,1,3,1,0,
			0,1,4,2,1,0,1,0,
			0,0,0,1,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==46
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,3,1,1,1,1,1,0,
			0,1,5,1,5,1,1,0,
			0,5,2,5,5,5,4,0,
			0,1,5,1,1,1,1,0,
			0,1,1,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==47
	){	const lvlMap = [ // C: char lvlMap[99]
			0,0,0,0,0,0,0,0,0,0,0,
			0,0,1,1,1,1,0,0,0,0,0,
			0,0,1,1,2,2,0,0,0,0,0,
			0,1,1,0,2,1,1,0,0,0,0,
			0,1,2,1,1,0,4,0,0,0,0,
			0,1,1,2,0,0,4,4,0,0,0,
			0,0,1,1,1,4,4,4,2,1,0,
			0,0,0,0,0,3,1,1,1,1,0,
		]; mapWidth  = 11
		;  mapHeight = 9
		; await playLvl(lvlMap);
	} else if (level ==48
	){	const lvlMap = [ // C: char lvlMap[88]
			0,0,0,0,0,0,0,0,0,0,0,
			0,1,1,1,4,2,3,0,0,0,0,
			0,1,2,4,1,5,1,0,0,0,0,
			0,0,1,0,5,5,1,1,0,0,0,
			0,0,1,5,4,5,1,1,2,1,0,
			0,0,1,1,1,1,1,1,1,1,0,
			0,0,0,0,0,0,0,0,1,1,0,
		]; mapWidth  = 11
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==49
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,4,1,1,3,4,0,0,
			0,1,1,2,0,1,0,0,
			0,1,0,1,2,4,1,0,
			0,1,1,1,2,0,1,0,
			0,0,0,0,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==50
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,1,1,4,3,0,0,
			0,0,1,1,1,2,4,0,
			0,0,0,0,5,0,1,0,
			0,0,1,1,1,1,1,0,
			0,1,1,2,1,1,0,0,
			0,1,1,1,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==51
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,3,4,1,1,0,0,
			0,1,2,2,5,1,0,0,
			0,1,1,0,1,1,0,0,
			0,1,1,0,1,1,4,0,
			0,0,0,0,1,0,1,0,
			0,0,0,0,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==52
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,3,1,1,1,1,0,
			0,4,1,0,1,1,1,0,
			0,1,2,2,2,4,0,0,
			0,1,4,0,1,1,0,0,
			0,1,1,0,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==53
	){	const lvlMap = [ // C: char lvlMap[120]
			0,0,0,0,0,0,0,0,0,0,0,0,
			0,1,4,4,5,1,1,1,2,1,0,0,
			0,1,4,5,4,1,2,1,1,1,1,0,
			0,0,4,4,0,0,0,0,1,1,1,0,
			0,0,0,0,0,4,0,0,1,0,0,0,
			0,0,3,1,0,1,2,1,1,0,0,0,
			0,0,1,2,0,1,0,2,1,0,0,0,
			0,0,1,1,2,1,2,1,0,0,0,0,
			0,0,0,1,1,1,1,1,0,0,0,0,
		]; mapWidth  = 12
		;  mapHeight = 10
		; await playLvl(lvlMap);
	} else if (level ==54
	){	const lvlMap = [ // C: char lvlMap[121]
			0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,1,1,0,0,0,0,0,0,
			0,1,1,1,1,0,3,1,1,1,0,
			0,1,1,0,1,2,1,2,2,1,0,
			0,1,1,1,2,1,1,1,1,0,0,
			0,0,2,0,0,1,0,0,0,0,0,
			0,0,1,1,0,2,1,0,0,0,0,
			0,0,0,4,4,4,4,0,0,0,0,
			0,0,0,0,0,4,1,0,0,0,0,
			0,0,0,0,0,4,1,0,0,0,0,
		]; mapWidth  = 11
		;  mapHeight = 11
		; await playLvl(lvlMap);
	} else if (level ==55
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,1,1,1,0,0,0,0,
			0,1,0,1,1,1,1,0,
			0,1,1,2,5,5,4,0,
			0,1,0,1,0,1,1,0,
			0,3,1,1,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==56
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,0,1,3,0,0,
			0,0,0,0,1,1,1,0,
			0,4,1,0,2,2,1,0,
			0,1,1,1,1,1,0,0,
			0,4,1,1,2,0,0,0,
			0,0,4,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==57
	){	const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,0,0,
			0,1,4,4,0,0,0,0,
			0,1,2,1,1,1,1,0,
			0,1,1,0,2,0,1,0,
			0,1,3,1,4,2,1,0,
		]; mapWidth  = 8
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level ==58
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,0,0,0,0,0,
			0,1,1,0,0,0,0,0,
			0,1,4,5,1,1,1,0,
			0,0,2,1,1,1,1,0,
			0,0,1,0,2,0,0,0,
			0,0,4,1,3,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==59
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,0,1,1,0,0,0,
			0,0,0,1,1,0,0,0,
			0,0,0,1,4,4,1,0,
			0,1,1,2,0,1,1,0,
			0,1,1,4,2,2,1,0,
			0,0,0,0,1,3,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} if (level ==60 // Note: This is 'if', not 'else if'
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,1,1,1,1,1,0,
			0,4,0,0,1,4,0,
			0,5,1,1,2,3,0,
			0,1,1,0,2,1,0,
			0,1,1,0,1,1,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==61
	){	const lvlMap = [ // C: char lvlMap[80]
			0,0,0,0,0,0,0,0,0,0,
			0,1,1,3,0,0,1,1,0,0,
			0,1,2,2,1,1,4,4,0,0,
			0,1,1,2,2,0,4,4,1,0,
			0,1,2,2,1,0,4,4,1,0,
			0,1,1,0,1,0,0,0,0,0,
			0,0,1,1,1,0,0,0,0,0,
		]; mapWidth  = 10
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==62
	){	const lvlMap = [ // C: char lvlMap[80]
			0,0,0,0,0,0,0,0,0,0,
			0,0,0,1,1,1,0,0,0,0,
			0,0,1,2,1,1,1,2,1,0,
			0,0,4,1,2,2,0,2,3,0,
			0,0,4,0,0,1,1,2,1,0,
			0,1,5,4,0,1,1,1,0,0,
			0,1,4,4,4,1,0,0,0,0,
		]; mapWidth  = 10
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==63
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,4,4,4,0,0,0,0,
			0,4,2,2,1,0,0,0,
			0,3,5,1,2,1,4,0,
			0,0,0,1,2,1,1,0,
			0,0,0,1,1,2,1,0,
			0,0,0,0,0,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==64
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,3,1,1,0,0,0,0,
			0,1,0,1,0,0,0,0,
			0,1,4,2,2,1,1,0,
			0,1,4,4,2,0,1,0,
			0,0,0,1,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==65
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,4,1,1,0,0,0,
			0,1,0,1,1,1,0,
			0,1,4,1,0,1,0,
			0,1,2,5,2,1,0,
			0,0,3,1,0,0,0,
			0,0,1,1,0,0,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==66
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,1,4,1,1,0,0,
			0,1,1,0,3,0,0,
			0,1,1,2,1,0,0,
			0,0,2,0,1,1,0,
			0,1,1,1,0,1,0,
			0,4,1,5,1,1,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==67
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,1,1,4,1,0,0,0,
			0,1,1,1,1,0,0,0,
			0,1,0,2,2,4,1,0,
			0,4,1,1,0,0,1,0,
			0,3,2,1,0,0,1,0,
			0,0,0,1,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==68
	){	const lvlMap = [ // C: char lvlMap[132]
			0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,1,1,0,0,0,
			0,0,0,0,0,0,0,1,1,0,0,0,
			0,0,1,1,1,0,0,1,1,1,1,0,
			0,3,2,1,1,2,1,2,0,1,1,0,
			0,1,1,0,0,2,2,1,1,2,1,0,
			0,0,1,2,1,1,0,0,4,2,1,0,
			0,0,0,1,1,1,0,4,4,5,0,0,
			0,0,0,0,0,0,0,4,4,4,0,0,
			0,0,0,0,0,0,0,4,4,0,0,0,
		]; mapWidth  = 12
		;  mapHeight = 11
		; await playLvl(lvlMap);
	} else if (level ==69
	){	const lvlMap = [ // C: char lvlMap[72]
			0,0,0,0,0,0,0,0,0,
			0,0,0,4,4,4,1,1,0,
			0,0,1,1,0,2,0,1,0,
			0,0,1,1,1,1,0,1,0,
			0,0,1,0,0,2,0,1,0,
			0,1,1,1,1,2,1,1,0,
			0,3,1,1,0,1,1,0,0,
		]; mapWidth  = 9
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==70
	){	const lvlMap = [ // C: char lvlMap[72]
			0,0,0,0,0,0,0,0,0,
			0,4,4,4,0,1,1,0,0,
			0,1,4,5,1,1,1,0,0,
			0,0,3,2,2,2,1,1,0,
			0,0,0,0,1,2,1,1,0,
			0,0,0,0,1,1,1,0,0,
			0,0,0,0,0,1,1,0,0,
		]; mapWidth  = 9
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==71
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,0,0,1,3,0,0,0,
			0,0,0,1,1,0,0,0,
			0,1,1,2,5,1,1,0,
			0,1,1,5,4,1,1,0,
			0,0,0,1,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==72
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,1,1,4,3,1,0,
			0,1,0,4,0,1,0,
			0,1,1,1,2,1,0,
			0,4,2,2,1,0,0,
			0,1,1,0,0,0,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==73
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,4,1,1,0,0,0,
			0,1,0,1,0,0,0,
			0,1,5,2,1,1,0,
			0,1,1,2,4,1,0,
			0,1,1,3,0,0,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} if (level ==74 // Note: This is 'if', not 'else if'
	){	const lvlMap = [ // C: char lvlMap[63]
			0,0,0,0,0,0,0,0,0,
			0,0,0,0,1,1,1,0,0,
			0,0,0,0,1,0,1,0,0,
			0,1,1,2,4,2,1,1,0,
			0,1,1,4,2,4,0,1,0,
			0,0,0,0,3,1,1,1,0,
		]; mapWidth  = 9
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==75
	){	const lvlMap = [ // C: char lvlMap[132]
			0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,1,1,1,1,0,0,0,0,0,
			0,0,0,2,1,2,1,0,0,0,0,0,
			0,1,1,1,2,1,1,1,2,1,0,0,
			0,1,2,1,0,1,2,1,4,5,1,0,
			0,0,0,1,1,0,1,1,0,4,1,0,
			0,0,0,1,1,2,1,0,4,4,3,0,
			0,0,0,1,1,2,0,0,4,4,4,0,
			0,0,0,0,1,2,1,0,0,0,0,0,
			0,0,0,0,1,1,4,4,0,0,0,0,
		]; mapWidth  = 12
		;  mapHeight = 11
		; await playLvl(lvlMap);
	} else if (level ==76
	){	const lvlMap = [ // C: char lvlMap[72]
			0,0,0,0,0,0,0,0,0,
			0,0,0,4,4,4,1,4,0,
			0,0,1,2,0,4,0,1,0,
			0,0,2,3,1,1,2,1,0,
			0,0,1,0,0,2,0,1,0,
			0,1,2,1,1,1,1,1,0,
			0,1,1,1,0,1,1,0,0,
		]; mapWidth  = 9
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==77
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,
			0,0,1,1,1,0,0,
			0,1,2,0,1,0,0,
			0,1,4,1,3,0,0,
			0,1,5,1,1,1,0,
			0,0,1,0,2,1,0,
			0,0,4,1,1,0,0,
		]; mapWidth  = 7
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==78
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,3,1,0,0,0,0,
			0,0,1,1,0,0,0,0,
			0,0,4,1,0,0,0,0,
			0,1,2,2,4,1,4,0,
			0,1,1,2,1,0,0,0,
			0,0,0,1,1,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==79
	){	const lvlMap = [ // C: char lvlMap[49]
			0,0,0,0,0,0,0,
			0,0,0,1,1,1,0,
			0,0,0,1,0,4,0,
			0,0,0,1,1,4,0,
			0,3,1,2,2,1,0,
			0,1,1,4,2,1,0,
		]; mapWidth  = 7
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==80
	){	const lvlMap = [ // C: char lvlMap[48]
			0,0,0,0,0,0,0,0,
			0,0,0,4,1,0,0,0,
			0,1,4,1,1,0,0,0,
			0,1,1,1,2,2,1,0,
			0,0,1,4,1,2,3,0,
		]; mapWidth  = 8
		;  mapHeight = 6
		; await playLvl(lvlMap);
	} else if (level ==81
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,0,3,1,1,1,0,0,
			0,0,0,2,1,1,1,0,
			0,0,0,1,4,1,1,0,
			0,1,2,1,0,2,0,0,
			0,1,4,1,1,4,0,0,
			0,0,0,0,1,1,0,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==82
	){	const lvlMap = [ // C: char lvlMap[56]
			0,0,0,0,0,0,0,0,
			0,1,1,4,0,1,3,0,
			0,1,0,1,2,1,1,0,
			0,1,2,4,0,2,1,0,
			0,0,1,4,1,1,1,0,
			0,0,1,1,0,0,0,0,
		]; mapWidth  = 8
		;  mapHeight = 7
		; await playLvl(lvlMap);
	} else if (level ==83
	){	const lvlMap = [ // C: char lvlMap[64]
			0,0,0,0,0,0,0,0,
			0,4,4,4,4,0,0,0,
			0,4,2,5,2,0,0,0,
			0,3,5,1,2,1,1,0,
			0,0,0,1,2,1,1,0,
			0,0,0,1,1,2,1,0,
			0,0,0,0,1,1,1,0,
		]; mapWidth  = 8
		;  mapHeight = 8
		; await playLvl(lvlMap);
	} else if (level ==84
	){	const lvlMap = [ // C: char lvlMap[110]
			0,0,0,0,0,0,0,0,0,0,0,
			0,4,4,0,0,0,0,0,0,0,0,
			0,4,4,4,3,0,0,0,0,0,0,
			0,4,4,2,1,1,1,1,1,1,0,
			0,0,0,2,1,0,0,0,1,1,0,
			0,0,0,1,2,0,1,2,1,0,0,
			0,1,1,1,1,2,1,1,1,0,0,
			0,1,2,2,1,0,0,1,1,0,0,
			0,1,1,1,0,0,0,1,1,0,0,
		]; mapWidth  = 11
		;  mapHeight = 10
		; await playLvl(lvlMap);
	}

}


async function sokobanMenu() { // C: void sokobanMenu()
	while (true) { // C: while(1)
		let i; // C: char i
		let str2 = [0,0]; // C: char str2[2] = {0};
		let saveData = Array(180).fill(0); // C: char saveData[180] = {0};
		Bfile_ReadFile(fileHandle, saveData, 170, 0); // C: Bfile_ReadFile(fileHandle, &saveData, 170, 0); (saveData is passed by ref in JS and modified by shim)
		ML_clear_vram();
		ML_vertical_line(0, 8, 63, 1);
		ML_vertical_line(127, 8, 63, 1);
		//ML_rectangle(0, 0, 127, 8, 1, 1, 1);
		ML_horizontal_line(8, 0, 127, 1);
		PrintXY(3, 0, "Choisissez un niveau", 0); // Assuming PrintXY handles JS string
		ML_horizontal_line(63, 0, 127, 1);
		for (i = 0; i < 84; i++) { //displays each number
			if (i < 9) {
				PrintMini(9*(i%14)+4, 9*Math.floor(i/14)+11, String.fromCharCode(i+49), 0);
			} else {
				PrintMini(9*(i%14)+2, 9*Math.floor(i/14)+11, String.fromCharCode(Math.floor((i+1)/10)+48), 0); //first digit
				PrintMini(9*(i%14)+6, 9*Math.floor(i/14)+11, String.fromCharCode(((i+1)%10)+48), 0); //second digit
			}
			if (!saveData[2*i]) {
				/*ML_vertical_line(9*(i%14)+1, 9*(i/14)+9, 9*(i/14)+17, 1);
				ML_vertical_line(9*(i%14)+9, 9*(i/14)+9, 9*(i/14)+17, 1);
				ML_horizontal_line(9*(i/14)+9, 9*(i%14)+1, 9*(i%14)+9, 1);
				ML_horizontal_line(9*(i/14)+17, 9*(i%14)+1, 9*(i%14)+9, 1);*/
				Bdisp_AreaReverseVRAM(9*(i%14)+1, 9*Math.floor(i/14)+9, 9*(i%14)+9, 9*Math.floor(i/14)+17);
			}
		}
		do {
			ML_horizontal_line(posY, posX, posX+8, 2);
			ML_horizontal_line(posY+8, posX, posX+8, 2);
			ML_vertical_line(posX, posY+1, posY+7, 2);
			ML_vertical_line(posX+8, posY+1, posY+7, 2);
			//Bdisp_AreaReverseVRAM(posX, posY, posX+8, posY+8);
			key = await GetKey(); // C: GetKey(&key);
			ML_horizontal_line(posY, posX, posX+8, 2);
			ML_horizontal_line(posY+8, posX, posX+8, 2);
			ML_vertical_line(posX, posY+1, posY+7, 2);
			ML_vertical_line(posX+8, posY+1, posY+7, 2);
			//Bdisp_AreaReverseVRAM(posX, posY, posX+8, posY+8);
			if (key == KEY_CTRL_DOWN) {
				posY += 9;
			} else if (key == KEY_CTRL_UP) {
				posY -= 9;
			} else if (key == KEY_CTRL_LEFT) {
				posX -= 9;
			} else if (key == KEY_CTRL_RIGHT) {
				posX += 9;
			}
			if (posY > 60) {
				posY = 9;
			}
			if (posY < 8) {
				posY = 54;
			}
			if (posX < 1) {
				posX = 118;
			}
			if (posX > 120) {
				posX = 1;
			}
            await new Promise(resolve => requestAnimationFrame(resolve));
		} while (key != KEY_CTRL_EXE);
		do {
			await sokobanLvl(Math.floor((posX+8)/9)+14*(Math.floor((posY-9)/9))); // C: integer division
            await new Promise(resolve => requestAnimationFrame(resolve));
		} while (key == KEY_CTRL_F1 || key == KEY_CTRL_SHIFT || key == KEY_CTRL_EXE); // Original used KEY_CTRL_EXE, this implies it could re-trigger. Re-check. Yes, it will use the old key value.
                                                                                  // After sokobanLvl returns, 'key' still holds its value from GetKey inside playLvl, if playLvl exits via one of these keys.
                                                                                  // If playLvl exits via EXIT, this loop breaks. If via F1/SHIFT/EXE, this loop continues with that key value.
		if (hasWon) {
			let writeData = 0; // C: char writeData = 0;
			ML_clear_vram();
			locate(3,4);Print("Vous avez gagn\xE6\x0A!"); // C: "Vous avez gagn""\xE6\x0A""!" -> "Vous avez gagn\xE6\x0A!"
			ML_display_vram();
			Bfile_SeekFile(fileHandle, 2*(Math.floor((posX+8)/9)+14*(Math.floor((posY-9)/9))-1)); // C: integer division
			Bfile_WriteFile(fileHandle, [writeData], 1); // C: &writeData. Pass as array for JS shim.
			await Sleep(1000);
		}
	}
}



async function AddIn_main(isAppli, OptionNum) { // C: int AddIn_main(int isAppli, unsigned short OptionNum)
	const filename = "\\\\fls0\\sokobanU.sav";

	fileHandle = Bfile_OpenFile(filename, _OPENMODE_READWRITE);
	if (fileHandle < 0) { //error, file likely does not exist
		Bfile_CreateFile(filename, 180);
		fileHandle = Bfile_OpenFile(filename, _OPENMODE_READWRITE); // Re-open after creation
	}
	await sokobanMenu();

    ML_horizontal_line(4, 10, 30, 1);
    ML_vertical_line(50, 60, 20, 1);
    ML_line(10, 50, 30, 70, 1);
    Bdisp_AreaReverseVRAM(4, 4, 70, 20); // C: Bdisp_AreaReverseVRAM(4, 4, 30, 20);
    ML_display_vram();

    return 1;
}

return {AddIn_main}

}
