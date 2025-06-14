<template>
    <div class="calc-emulator-container">
        <canvas ref="emulatorCanvas" :width="canvasWidth" :height="canvasHeight" class="calculator-screen"></canvas>
        <div class="calculator-case">
            <div class="arrows">

                <div style="position: relative;">

                    <button class="up" ontouchstart="" :class="{'active': pressedKeys.has(KEY_CTRL_UP_CONST)}" :keycode="KEY_CTRL_UP_CONST"></button>
                    <button class="down" :class="{'active': pressedKeys.has(KEY_CTRL_DOWN_CONST)}" :keycode="KEY_CTRL_DOWN_CONST"></button>
                    <button class="left" :class="{'active': pressedKeys.has(KEY_CTRL_LEFT_CONST)}" :keycode="KEY_CTRL_LEFT_CONST"></button>
                    <button class="right" :class="{'active': pressedKeys.has(KEY_CTRL_RIGHT_CONST)}" :keycode="KEY_CTRL_RIGHT_CONST"></button>
                </div>
            </div>
            <button :keycode="KEY_CTRL_EXE_CONST" class="exe" :class="{'active': pressedKeys.has(KEY_CTRL_EXE_CONST)}">
                <div><img src="/exe-2.png"/></div>
            </button>
            <button :keycode="KEY_CTRL_EXIT_CONST" class="exit" :class="{'active': pressedKeys.has(KEY_CTRL_EXIT_CONST)}">
                <div><img src="/exit-2.png"/></div>
            </button>
        </div>
        <div class="error-message" v-if="errorMessage">
            <p>{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';

import { font_5x8, font_5x8_special_chars, font_4x6, length_initial_data, ltr_initial_data } from './fonts.js'; // Import the fonts

const props = defineProps({
    program: {
        type: Function,
        required: true,
    },
});

const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 64;
const PIXEL_ON_COLOR = '#333333'; // Dark grey/black for "on" pixels
const PIXEL_OFF_COLOR = '#C8D0C0'; // Light LCD green/grey for "off" pixels

// Key constants (using KeyboardEvent.code values)
const KEY_CTRL_UP_CONST = 'ArrowUp';
const KEY_CTRL_DOWN_CONST = 'ArrowDown';
const KEY_CTRL_LEFT_CONST = 'ArrowLeft';
const KEY_CTRL_RIGHT_CONST = 'ArrowRight';
const KEY_CTRL_EXE_CONST = 'Enter';
const KEY_CTRL_SHIFT_CONST = "ShiftLeft";
const KEY_CTRL_EXIT_CONST = "Escape";
const KEY_CTRL_F1_CONST = "F1";
const KEY_CTRL_F2_CONST = "F2";
const KEY_CTRL_F3_CONST = "F3";
const KEY_CTRL_F4_CONST = "F4";
const KEY_CTRL_F5_CONST = "F5";
const KEY_CTRL_F6_CONST = "F6";
const KEY_CTRL_SPACE_CONST = "Space";

const keys = [
    KEY_CTRL_UP_CONST,
    KEY_CTRL_DOWN_CONST,
    KEY_CTRL_LEFT_CONST,
    KEY_CTRL_RIGHT_CONST,
    KEY_CTRL_EXE_CONST,
    KEY_CTRL_EXIT_CONST,
];


const emulatorCanvas = ref(null);
const canvasCtx = ref(null);
const vram = ref(new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT));
const currentScale = ref(2); // Default scale
const pressedKeys = ref(new Set());
const isProgramRunning = ref(false);
const displayCursorX = ref(0);
const displayCursorY = ref(0);
const errorMessage = ref('');
const savedDisplays = ref({});
const ML_TRANSPARENT = -1;
const ML_WHITE = 0;
const ML_BLACK = 1;
const ML_XOR = 2;
const ML_CHECKER = 3;

const IMB_WRITEMODIFY_NORMAL = 0x01;
const IMB_WRITEMODIFY_REVERCE = 0x02;
const IMB_WRITEMODIFY_MESH = 0x03;
const IMB_AREAKIND_OVER = 0x01;
const IMB_AREAKIND_MESH = 0x02;
const IMB_AREAKIND_CLR = 0x03;
const IMB_AREAKIND_REVERSE = 0x04;
const IMB_WRITEKIND_OVER = 0x01;
const IMB_WRITEKIND_OR = 0x02;
const IMB_WRITEKIND_AND = 0x03;
const IMB_WRITEKIND_XOR = 0x04;
const MINI_OVER = 0x10;
const MINI_OR = 0x11;
const MINI_REV = 0x12;
const MINI_REVOR = 0x13;

let programInstance = null;

const canvasWidth = computed(() => SCREEN_WIDTH * currentScale.value);
const canvasHeight = computed(() => SCREEN_HEIGHT * currentScale.value);

function SaveDisp(id) {
    if (id === undefined || id === null) {
        id = 0;
    }
    savedDisplays.value[id] = vram.value.slice();
}
function RestoreDisp(id) {
    if (id === undefined || id === null) {
        id = 0;
    }
    if (savedDisplays.value[id]) {
        vram.value.set(savedDisplays.value[id]);
    } else {
        console.warn(`No saved display found for ID: ${id}`);
    }
}

// --- VRAM and Display API ---
const ML_clear_vram = () => {
    vram.value.fill(0);
};

const ML_pixel = (x, y, color) => { // color = 1 for ON, 0 for OFF
    if (typeof color !== 'number' || (color !== -1 && color !== 0 && color !== 1 && color !== 2)) {
        throw new Error("ML_pixel: color must be -1, 0, 1, or 2, got " + JSON.stringify(color));
    }
    x = Math.floor(x);
    y = Math.floor(y);
    if (color === ML_TRANSPARENT) return; // Do nothing for transparent color
    if (x >= 0 && x < SCREEN_WIDTH && y >= 0 && y < SCREEN_HEIGHT) {
        vram.value[y * SCREEN_WIDTH + x] = color === 2 ? 1 - vram.value[y * SCREEN_WIDTH + x] : color;
    }
};

function Bdisp_SetPoint_VRAM(x, y, color) {
    ML_pixel(x, y, color);
}

function ML_pixel_test(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= SCREEN_WIDTH || y < 0 || y >= SCREEN_HEIGHT) {
        return ML_TRANSPARENT; // Out of bounds
    }
    return vram.value[y * SCREEN_WIDTH + x] === 1 ? ML_BLACK : ML_WHITE;
}

const ML_horizontal_line = (y, x1, x2, color) => {
    // Make sure y is within bounds
    if (y < 0 || y >= SCREEN_HEIGHT) return;

    // Ensure x1 <= x2
    if (x1 > x2) [x1, x2] = [x2, x1];

    // Draw the horizontal line
    for (let x = x1; x <= x2; x++) {
        ML_pixel(x, y, color);
    }
};

const ML_vertical_line = (x, y1, y2, color) => {
    // Make sure x is within bounds
    if (x < 0 || x >= SCREEN_WIDTH) return;

    // Ensure y1 <= y2
    if (y1 > y2) [y1, y2] = [y2, y1];

    // Draw the vertical line
    for (let y = y1; y <= y2; y++) {
        ML_pixel(x, y, color);
    }
};

const ML_line = (x1, y1, x2, y2, color) => {
    // Input validation and clipping could be added here
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);

    let cumul = 0;
    let i = 0;
    let x = x1;
    let y = y1;
	let dx = x2 - x1;
	let dy = y2 - y1;
	let sx = dx < 0 ? -1 : 1;
	let sy = dy < 0 ? -1 : 1;
	dx = Math.abs(dx);
	dy = Math.abs(dy);
	ML_pixel(x, y, color);
	if(dx > dy)
	{
		cumul = Math.floor(dx / 2);
		for(i=1 ; i<dx ; i++)
		{
			x += sx;
			cumul += dy;
			if(cumul > dx)
			{
				cumul -= dx;
				y += sy;
			}
			ML_pixel(x, y, color);
		}
	}
	else
	{
		cumul = Math.floor(dy / 2);
		for(i=1 ; i<dy ; i++)
		{
			y += sy;
			cumul += dx;
			if(cumul > dy)
			{
				cumul -= dy;
				x += sx;
			}
			ML_pixel(x, y, color);
		}
	}
};

function Bdisp_DrawLineVRAM(x1, y1, x2, y2) {
    ML_line(x1, y1, x2, y2, ML_BLACK);
}

const ML_rectangle = (x1, y1, x2, y2, border_width, border_color, fill_color) => {
    let i;
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);

    //console.log(`ML_rectangle: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}, border_width=${border_width}, border_color=${border_color}, fill_color=${fill_color}`);

    if (x1 > x2) {
        i = x1;
        x1 = x2;
        x2 = i;
    }
    if (y1 > y2) {
        i = y1;
        y1 = y2;
        y2 = i;
    }
    if (border_width > Math.floor((x2 - x1) / 2 + 1)) border_width = Math.floor((x2 - x1) / 2 + 1);
    if (border_width > Math.floor((y2 - y1) / 2 + 1)) border_width = Math.floor((y2 - y1) / 2 + 1);
    if (border_color != ML_TRANSPARENT && border_width > 0) {
        for (i = 0; i < border_width; i++) {
            ML_horizontal_line(y1 + i, x1, x2, border_color);
            ML_horizontal_line(y2 - i, x1, x2, border_color);
        }
        for (i = y1 + border_width; i <= y2 - border_width; i++) {
            ML_horizontal_line(i, x1, x1 + border_width - 1, border_color);
            ML_horizontal_line(i, x2 - border_width + 1, x2, border_color);
        }
    }
    if (fill_color != ML_TRANSPARENT) {
        for (i = y1 + border_width; i <= y2 - border_width; i++) {
            ML_horizontal_line(i, x1 + border_width, x2 - border_width, fill_color);
        }
    }
}

const ML_point = (x, y, width, color) => {
    x = Math.floor(x);
    y = Math.floor(y);
    if (width < 1) return;
    if (width == 1) {
        ML_pixel(x, y, color);
    } else {
        let padding = Math.floor(width / 2);
        let pair = !(width & 1) ? 1 : 0; // Check if width is even
        ML_rectangle(x - padding + pair, y - padding + pair, x + padding, y + padding, 0, 0, color);
    }
};

const ML_filled_circle = (x, y, radius, color) => {
    let plot_x, plot_y, d;

    if (radius < 0) return;
    plot_x = 0;
    plot_y = radius;
    d = 1 - radius;

    ML_horizontal_line(y, x - plot_y, x + plot_y, color);
    while (plot_y > plot_x) {
        if (d < 0) {
            d += 2 * plot_x + 3;
        } else {
            d += 2 * (plot_x - plot_y) + 5;
            plot_y--;
            ML_horizontal_line(y + plot_y + 1, x - plot_x, x + plot_x, color);
            ML_horizontal_line(y - plot_y - 1, x - plot_x, x + plot_x, color);
        }
        plot_x++;
        if (plot_y >= plot_x) {
            ML_horizontal_line(y + plot_x, x - plot_y, x + plot_y, color);
            ML_horizontal_line(y - plot_x, x - plot_y, x + plot_y, color);
        }
    }
};

const ML_circle = (x, y, radius, color) => {
	let plot_x, plot_y, d;

	if(radius < 0) return;
	plot_x = 0;
	plot_y = radius;
	d = 1 - radius;

	ML_pixel(x, y+plot_y, color);
	if(radius)
	{
		ML_pixel(x, y-plot_y, color);
		ML_pixel(x+plot_y, y, color);
		ML_pixel(x-plot_y, y, color);
	}
	while(plot_y > plot_x)
	{
		if(d < 0)
			d += 2*plot_x+3;
		else
		{
			d += 2*(plot_x-plot_y)+5;
			plot_y--;
		}
		plot_x++;
		if(plot_y >= plot_x)
		{
			ML_pixel(x+plot_x, y+plot_y, color);
			ML_pixel(x-plot_x, y+plot_y, color);
			ML_pixel(x+plot_x, y-plot_y, color);
			ML_pixel(x-plot_x, y-plot_y, color);
		}
		if(plot_y > plot_x)
		{
			ML_pixel(x+plot_y, y+plot_x, color);
			ML_pixel(x-plot_y, y+plot_x, color);
			ML_pixel(x+plot_y, y-plot_x, color);
			ML_pixel(x-plot_y, y-plot_x, color);
		}
	}
}

const ML_bmp_or = (bmp, x, y, width, height) => {
    if (!bmp || x < 0 || x > 128 - width || y < 1 - height || y > 63 || width < 1 || height < 1) return;
    ML_bmp_or_cl(bmp, x, y, width, height);
}

const ML_bmp_8_or = (bmp, x, y) => {
    return ML_bmp_or(bmp, x, y, 8, 8);
}

const ML_bmp_16_or = (bmp, x, y) => {
    return ML_bmp_or(bmp, x, y, 16, 16);
}

const ML_bmp_or_cl = (bmp, x, y, width, height) => {
    _displayBmp(bmp, x, y, width, height, IMB_WRITEKIND_OR);
}

const ML_bmp_and = (bmp, x, y, width, height) => {
    if (!bmp || x < 0 || x > 128 - width || y < 1 - height || y > 63 || width < 1 || height < 1) return;
    ML_bmp_and_cl(bmp, x, y, width, height);
}

const ML_bmp_and_cl = (bmp, x, y, width, height) => {
    _displayBmp(bmp, x, y, width, height, IMB_WRITEKIND_AND);
}

function _displayBmp(bmp, x, y, width, height, mode) {
    //console.log(bmp);
    for (let i = 0; i < height; i++) {
        if (y + i < 0 || y + i >= SCREEN_HEIGHT) continue; // Skip rows outside the screen
        let bytes = bmp.slice(i * Math.ceil(width / 8), (i + 1) * Math.ceil(width / 8));
        //console.log(`Row ${i}:`, bytes);
        for (let j = 0; j < width; j++) {
            if (x + j < 0 || x + j >= SCREEN_WIDTH) continue; // Skip columns outside the screen
            let byte = bytes[Math.floor(j / 8)];
            let bit = j % 8;

            let pixel = byte & (1 << (7 - bit));
            let existingPixel = vram.value[(y + i) * SCREEN_WIDTH + (x + j)];
            if (mode === IMB_WRITEKIND_OVER) {
                //overwrite
                ML_pixel(x + j, y + i, pixel ? 1 : 0); // Set pixel ON or OFF
            } else if (mode === IMB_WRITEKIND_OR) {
                if (pixel) {
                    ML_pixel(x + j, y + i, 1); // Set pixel ON
                }
            } else if (mode === IMB_WRITEKIND_AND) {
                if (pixel && existingPixel) {
                    ML_pixel(x + j, y + i, 1); // Set pixel ON
                } else {
                    ML_pixel(x + j, y + i, 0); // Set pixel OFF
                }
            } else if (mode === IMB_WRITEKIND_XOR) {
                if (pixel) {
                    ML_pixel(x + j, y + i, existingPixel ? 0 : 1); // Toggle pixel
                }
            } else {
                throw new Error("Unsupported mode: " + mode);
            }
        }
    }
}

const clearArea = (x1, y1, x2, y2) => {
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            ML_pixel(x, y, 0); // Set pixel OFF
        }
    }
};

const srand = (seed) => {
    //Do nothing, it is impossible to seed math.random
    throw new Error("srand: seeding is not supported in this environment.");
};

const rand = () => {
    // Return a pseudo-random number between 0 and 32767
    return Math.floor(Math.random() * 32768);
};

const PrintXY = (x, y, text, type) => {
    if (typeof text !== 'string') {
        throw new Error("PrintXY: text must be a string, got " + JSON.stringify(text));
    }
    //type: 0 = normal, 1 = reversed
    //console.log(`Print at (${x}, ${y}): ${text} [Type: ${type}]`);
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let bytes = [];
        let isGlyphUpsideDown = false;
        if (char.charCodeAt(0) === 0xE6) {
            //Handle multibyte character
            let multiByteChar = (text.charCodeAt(i) << 8) | text.charCodeAt(i + 1);
            if (font_5x8_special_chars[multiByteChar]) {
                bytes = font_5x8_special_chars[multiByteChar];
                i++; // Skip the next character since it's part of the multibyte character
            } else {
                throw new Error(`PrintXY: Unsupported multibyte character ${multiByteChar.toString(16)} at index ${i}`);
            }
            isGlyphUpsideDown = true; // Set flag for upside-down glyph
        } else {
            let charCode = char.charCodeAt(0) - 32;
            if (charCode < 0 || charCode >= font_5x8.length / 5) {
                charCode = "?".charCodeAt(0) - 32; // Default to '?' if out of bounds
            }
            bytes = font_5x8.slice(charCode * 5, charCode * 5 + 5);
        }
        for (let i = 0; i < 5; i++) {
            const byte = bytes[i];
            for (let bit = 0; bit < 8; bit++) {
                if (byte & (1 << (isGlyphUpsideDown ? 7 - bit : bit))) {
                    ML_pixel(x + i, y + bit, type === 1 ? 0 : 1); // Reverse color if type is 1
                } else {
                    ML_pixel(x + i, y + bit, type === 1 ? 1 : 0); // Reverse color if type is 1
                }
            }
        }
        x += 6; // Move to the next character position (5 pixels + 1 pixel space)
    }
}
const PrintMini = (x, y, text, type) => {
    if (typeof text !== 'string') {
        throw new Error("PrintMini: text must be a string, got " + JSON.stringify(text));
    }
    if (type !== 0) {
        throw new Error("Unhandled PrintMini type: " + type);
    }
    //console.log(`Print at (${x}, ${y}): ${text} [Type: ${type}]`);
    for (let char of text) {
        let charCode = char.charCodeAt(0) - 48;
        if (charCode < 0 || charCode >= (font_4x6.length / 4 - 1)) {
            charCode = 10; // Default to '?' if out of bounds
        }
        const bytes = font_4x6.slice(charCode * 4, charCode * 4 + 4);
        for (let i = 0; i < 4; i++) {
            const byte = bytes[i];
            for (let bit = 0; bit < 6; bit++) {
                if (byte & (1 << 5 - bit)) {
                    ML_pixel(x + i, y + bit, type === 1 ? 0 : 1); // Reverse color if type is 1
                } else {
                    ML_pixel(x + i, y + bit, type === 1 ? 1 : 0); // Reverse color if type is 1
                }
            }
        }
        x += 5; // Move to the next character position (4 pixels + 1 pixel space)
    }
}
const locate = (x, y) => {
    displayCursorX.value = Math.max(1, Math.min(x, 21));
    displayCursorY.value = Math.max(1, Math.min(y, 8));
    //console.log(`Cursor moved to (${x}, ${y})`);
};
const Print = (text) => {
    if (typeof text !== 'string') {
        throw new Error("Print: text must be a string, got " + JSON.stringify(text));
    }
    PrintXY((displayCursorX.value - 1) * 6 + 1, (displayCursorY.value - 1) * 8, text, 0);
}

// Definition of the Font class (equivalent to struct Font)
class Font {
    constructor() {
        // unsigned long ltr[220][2]; //an array of longs for each character
        this.ltr = Array(220).fill(null).map(() => [0, 0]);
        // char length[220]; //array of chars for the length of each character
        this.length = Array(220).fill(0);
    }
}

/*Here is how a character is defined.

Each character is 7 pixels high. The length is defined by you in the length array.

Because some characters (ex: m, M) are 5 px wide, the total amount is >32 bit,
so the character is stored in an array of 2 longs. The first long is only used if
the character is >32 bit.

For example, the character 'M', of length 3, is the following in binary:

00000
10001
11011
10101
10001
10001
00000

You must not forget the "00000" at the end, else your character will be shifted down by a pixel.
Now just remove the newlines in the character. You should get: 00000100011101110101100011000100000
Put that in a binary to decimal converter and you've got your number representing the character.

Also, make sure to define the correct length, else it will display gibberish.
*/

// Initialize normfont (global variable)
let normfont = new Font();

// C struct initialization: struct Font normfont = { {{...ltr_values...}}, {lengths...} };
// This means ltr_values go into normfont.ltr and lengths go into normfont.length.



for (let i = 0; i < ltr_initial_data.length; i++) {
    normfont.ltr[i][0] = ltr_initial_data[i][0];
    if (ltr_initial_data[i].length > 1) {
        normfont.ltr[i][1] = ltr_initial_data[i][1];
    } else {
        normfont.ltr[i][1] = 0; // Explicitly set second long to 0 if not provided (e.g. for space)
    }
}
// The rest of normfont.ltr (from index ltr_initial_data.length to 219) remains [0,0] due to Font constructor.

for (let i = 0; i < length_initial_data.length; i++) {
    normfont.length[i] = length_initial_data[i];
}
// The rest of normfont.length (from index length_initial_data.length to 219) remains 0.


//displays a given string, using a given font, at the given coordinates
//returns the height of the string
function dispStr(str, x2, y, limit) { // unsigned char* str -> JS string
    let k = 0;
    let x = x2;
    let y2 = y;
    do { //browses through the given string

        let charCode = str.charCodeAt(k);

        //word wrap: if the current character isn't a space, simply display it
        if (charCode != 32 && charCode != 0 && charCode != 10) { // ASCII: ' ', NUL, '\n'
            let fontIdx = charCode - 32;
            if (y >= -6 && y < 68) {

                let charlength = normfont.length[fontIdx];
                // Check if charlength is valid, C would use garbage or crash if fontIdx is out of bounds
                // or if length is 0 from uninitialized part.
                // JS arrays are bounds-checked or return undefined; normfont is pre-filled with 0s.
                if (charlength > 0 && fontIdx >= 0 && fontIdx < 220) {
                    let total_bits = 7 * charlength;
                    let j_init_val_mod_32 = total_bits % 32;
                    let j;
                    if (j_init_val_mod_32 === 0) { // If total_bits is a multiple of 32 (e.g. 32, 64)
                        // This means the bits for the "first" long segment (if used) would be 0 or 32.
                        // If 0 (e.g. total_bits is 32), (1 << -1) is UB. j should effectively start for the second long.
                        // If this means all bits are in normfont.ltr[fontIdx][1] (up to 32 bits),
                        // j should start at 1 << (total_bits - 1), assuming total_bits <= 32.
                        // Or, if total_bits > 32 and (total_bits % 32) == 0 means 32 bits in ltr[0], j starts 1<<31.
                        // The C code `1 << (X%32 - 1)` would be `1 << -1` if `X%32 == 0`.
                        // Let's assume charlengths are such that this specific UB is not hit,
                        // or that `1 << -1` results in 0 and the logic handles it.
                        // For charlengths 1-5, `total_bits % 32` is never 0.
                        // (7*1=7, 7*2=14, 7*3=21, 7*4=28, 7*5=35).
                        j = 1 << (total_bits - 1); // A more robust start for single-long characters
                        // This simplified j init is for characters fitting in one long. Multi-long needs the complex one.
                        // The original C logic for j initialization handles multi-long case.
                        // `j = 1 << (j_init_val_mod_32 - 1)` is correct given non-zero `j_init_val_mod_32`.
                        j = 1 << (j_init_val_mod_32 - 1);
                    } else {
                        j = 1 << (j_init_val_mod_32 - 1);
                    }

                    //char i; // C loop var

                    for (let i_loop = 0; i_loop < total_bits; i_loop++) { //browses through the pixels of the character specified, shifting the 1 of j to the right each time, so that it makes 0b01000.., 0b001000... etc

                        let bits_remaining_inclusive = total_bits - i_loop;
                        let long_idx_selector = Math.trunc(bits_remaining_inclusive / 33); // 1 for ltr[0] (MSB part), 0 for ltr[1] (LSB part)
                        let current_long_data = normfont.ltr[fontIdx][1 - long_idx_selector];

                        if (current_long_data & j) { //checks if the bit that is a 1 in the j is also a 1 in the character

                            ML_pixel(x + i_loop % (charlength), y + Math.trunc(i_loop / charlength), 1); //if so, locates the pixel at the coordinates, using modulo and division to calculate the coordinates relative to the top left of the character
                        }

                        if (j !== 1) { // Test before shift
                            j >>>= 1; // Unsigned right shift
                        } else { // If j was 1, it becomes MSB mask for next long segment
                            j = 0x80000000; // (1 << 31), which is -2147483648 in JS signed 32-bit
                        }

                    }
                } // end if charlength > 0
            } // end if y in bounds

            // If fontIdx was out of bounds or charlength was 0, what should x advance by?
            // C would use garbage `normfont.length[str[k]-32]`.
            // JS normfont.length defaults to 0 for uninitialized parts. So `x += 0 + 1;`
            // This seems like a reasonable behavior for unknown chars.
            let advance_x_by = (fontIdx >= 0 && fontIdx < 220 && normfont.length[fontIdx] > 0) ? normfont.length[fontIdx] : 0;
            x += advance_x_by + 1; //now that the character has been fully displayed, shifts the cursor right by the length of character + 1
        } else if (charCode == 10) { // '\n'
            y += 8;
            x = x2;
        } else if (charCode == 32) { // ' '

            let word_pixels = 0;
            let j_lookahead = k + 1;
            while (j_lookahead < str.length && str.charCodeAt(j_lookahead) != 32 && str.charCodeAt(j_lookahead) != 0 && str.charCodeAt(j_lookahead) != 10) { //as long as it doesn't encounter another space or end of string
                let next_char_code = str.charCodeAt(j_lookahead);
                let next_font_idx = next_char_code - 32;
                let next_char_len = 0;
                if (next_font_idx >= 0 && next_font_idx < 220) { // check bounds for safety
                    next_char_len = normfont.length[next_font_idx];
                }
                word_pixels += next_char_len + 1;
                j_lookahead++;
            }

            if (x + 4 + word_pixels > limit) { //the word can't be displayed, note that it is STRICTLY superior because we added an unnecessary pixel at the end
                y += 8; //goes on next line which is 8 pixels down
                x = x2; //puts cursor on beginning of line
            } else {
                x += 4; // space width
            }
        }
        k++;
    } while (k < str.length && str.charCodeAt(k) !== 0); // NUL char (0) also terminates C string
    return y + 8 - y2;
}

const _renderVRAMToCanvas = () => {
    if (!canvasCtx.value) return;
    const ctx = canvasCtx.value;
    const scale = currentScale.value;

    ctx.fillStyle = PIXEL_OFF_COLOR;
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);

    ctx.fillStyle = PIXEL_ON_COLOR;
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
        for (let x = 0; x < SCREEN_WIDTH; x++) {
            if (vram.value[y * SCREEN_WIDTH + x] === 1) {
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
};

const ML_display_vram = () => {
    _renderVRAMToCanvas();
};

function Bdisp_PutDisp_DD() {
    ML_display_vram();
}

// --- Area Clear Function ---
const Bdisp_AreaClr_VRAM = ({ left, right, top, bottom }) => {
    // Ensure coordinates are within bounds
    left = Math.max(0, Math.min(left, SCREEN_WIDTH - 1));
    right = Math.max(0, Math.min(right, SCREEN_WIDTH - 1));
    top = Math.max(0, Math.min(top, SCREEN_HEIGHT - 1));
    bottom = Math.max(0, Math.min(bottom, SCREEN_HEIGHT - 1));

    // Make sure left <= right and top <= bottom
    if (left > right) [left, right] = [right, left];
    if (top > bottom) [top, bottom] = [bottom, top];

    // Clear the specified area (set pixels to 0/OFF)
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            vram.value[y * SCREEN_WIDTH + x] = 0;
        }
    }
};

const Bdisp_AreaReverseVRAM = (left, top, right, bottom) => {
    // Ensure coordinates are within bounds
    left = Math.max(0, Math.min(left, SCREEN_WIDTH - 1));
    right = Math.max(0, Math.min(right, SCREEN_WIDTH - 1));
    top = Math.max(0, Math.min(top, SCREEN_HEIGHT - 1));
    bottom = Math.max(0, Math.min(bottom, SCREEN_HEIGHT - 1));

    // Make sure left <= right and top <= bottom
    if (left > right) [left, right] = [right, left];
    if (top > bottom) [top, bottom] = [bottom, top];

    // Reverse pixels in the specified area (toggle 0 to 1 and 1 to 0)
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            const index = y * SCREEN_WIDTH + x;
            vram.value[index] = 1 - vram.value[index]; // Toggle between 0 and 1
        }
    }
};

function Bdisp_ReadArea_VRAM(area) {
    // Ensure coordinates are within bounds
    const left = Math.max(0, Math.min(area.left, SCREEN_WIDTH - 1));
    const right = Math.max(0, Math.min(area.right, SCREEN_WIDTH - 1));
    const top = Math.max(0, Math.min(area.top, SCREEN_HEIGHT - 1));
    const bottom = Math.max(0, Math.min(area.bottom, SCREEN_HEIGHT - 1));

    // Make sure left <= right and top <= bottom
    if (left > right) [left, right] = [right, left];
    if (top > bottom) [top, bottom] = [bottom, top];

    // Read the specified area into a new array
    const result = [];
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            result.push(vram.value[y * SCREEN_WIDTH + x]);
        }
    }
    return result;
}

function Bdisp_WriteGraph_VRAM(area) {
    let width = area.width, height = area.height;
    let x = area.GraphData.x, y = area.GraphData.y;
    let writeModify = area.GraphData.WriteModify;
    let bitmap = area.GraphData.pBitmap;
    let writeKind = area.GraphData.WriteKind || IMB_WRITEKIND_OVER;
    if (writeKind !== IMB_WRITEKIND_OVER) {
        throw new Error("Bdisp_WriteGraph_VRAM: Unsupported WriteKind: " + writeKind);
    }
    ML_bmp_

}

function Bdisp_AllClr_DDVRAM() {
    ML_clear_vram();
    ML_display_vram();
}

const PopUpWin = (nbLines) => {
    let x1 = 9;
    let y1 = Math.max(3, 20 - Math.floor(nbLines / 2) * 8);
    let x2 = x1 + 108;
    let y2 = y1 + nbLines * 8 + 7;
    ML_rectangle(x1, y1, x2, y2, 1, ML_BLACK, ML_WHITE);
    ML_horizontal_line(y2+1, x1+1, x2+1, ML_BLACK);
    ML_vertical_line(x2+1, y1+1, y2+1, ML_BLACK);
}

const Sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Global state for the "opened" file
const g_currentOpenFileKey = ref(-1); // Stores the localStorage key string for the currently "open" file
const g_currentFilePointer = ref(0);   // Current position for seek/write operations
const BFILE_PREFIX = "BFILE_FS_"; // Prefix to avoid collisions in localStorage

function Bfile_CloseFile(handle) {
    if (handle < 0 || !g_currentOpenFileKey.value) {
        throw new Error("Bfile_CloseFile: Invalid handle or no file open.");
    }
    handle = -1; // Reset handle to indicate no file is open
    g_currentOpenFileKey.value = -1; // Reset current open file key
}

function Bfile_DeleteFile(filename) {
    if (typeof filename !== "string") {
        throw new Error("Bfile_DeleteFile: filename must be a string, got " + JSON.stringify(filename));
    }
    const key = BFILE_PREFIX + filename;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        g_currentOpenFileKey.value = -1; // Reset current open file key
        g_currentFilePointer.value = 0; // Reset file pointer
        return 1; // Success
    }
    return -1; // File not found
}

/**
 * Opens a file.
 * Corresponds to Bfile_OpenFile in C.
 * @param {number[]} filename_arr - Array of char codes for the filename.
 * @param {number} mode - The open mode (e.g., _OPENMODE_READWRITE).
 * @returns {number} A handle (1 for success, -1 for failure).
 */
function Bfile_OpenFile(path, mode) {
    if (typeof path !== "string") {
        throw new Error("Bfile_OpenFile: path must be a string, got " + JSON.stringify(path));
    }
    const key = BFILE_PREFIX + path;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    if (localStorage.getItem(key) !== null) {
        g_currentOpenFileKey.value = key;
        g_currentFilePointer.value = 0; // Reset pointer on open
        console.log(`Bfile_OpenFile: Opened file ${path} with key ${key}`);
        return 1; // Success dummy handle (integer)
    }
    return -1; // File not found
}

/**
 * Creates a file.
 * Corresponds to Bfile_CreateFile in C.
 * @param {number[]} filename_arr - Array of char codes for the filename.
 * @param {number} size - The size of the file to create in bytes.
 * @returns {number} A handle (1 for success, negative for failure).
 */
function Bfile_CreateFile(path, size) {
    if (typeof path !== "string") {
        throw new Error("Bfile_CreateFile: path must be a string, got " + JSON.stringify(path));
    }
    const key = BFILE_PREFIX + path;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    try {
        const content = Array(size).fill(2 ** 16); // Initialize with all 1 because Casio
        localStorage.setItem(key, JSON.stringify(content));
        // Note: Unlike OpenFile, CreateFile in this shim doesn't automatically set g_currentOpenFileKey.
        // The C code pattern is CreateFile then OpenFile again, which will set it.
        return 1; // Success dummy handle
    } catch (e) {
        throw new Error("Bfile_CreateFile Error (localStorage): ", e.message);
    }
}

/**
 * Reads from a file from a specific position.
 * Corresponds to Bfile_ReadFile(int Handle, void *buf, int size, int readpos)
 * @param {number} handle - The file handle (expected to be 1 if open).
 * @param {number[]} buffer_arr_ref - The array to fill with read data (modified in place).
 * @param {number} len - The number of bytes to read.
 * @param {number} readpos - The absolute position in the file to start reading from.
 * @returns {number} The number of bytes actually read.
 */
function Bfile_ReadFile(handle, buffer_arr_ref, len, readpos) {
    if (handle < 0 || !g_currentOpenFileKey.value) {
        throw new Error("Bfile_ReadFile: Invalid handle or no file open.");
    }
    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    const fileDataString = localStorage.getItem(g_currentOpenFileKey.value);
    if (fileDataString === null) {
        throw new Error("Bfile_ReadFile: File key not found in localStorage.");
    }

    try {
        const fileBytes = JSON.parse(fileDataString);
        let bytesActuallyRead = 0;

        if (!Array.isArray(buffer_arr_ref)) {
            throw new Error("Bfile_ReadFile: buffer_arr_ref is not an array.");
        }
        // Clear the part of the buffer we are writing to, or ensure it's long enough.
        // The C code uses a pre-sized buffer. JS needs care if buffer_arr_ref can be shorter.
        // Assuming buffer_arr_ref is already appropriately sized (e.g., `saveData = Array(180)`).

        for (let i = 0; i < len; i++) {
            const currentReadBytePos = readpos + i;
            if (currentReadBytePos >= 0 && currentReadBytePos < fileBytes.length) {
                buffer_arr_ref[i] = fileBytes[currentReadBytePos];
                bytesActuallyRead++;
            } else {
                // Fill rest of buffer for this read operation with 0 if reading past EOF (or specific SDK behavior)
                // For simplicity, we just stop reading. The C code uses a fixed buffer, if len is too large, it might read garbage or crash.
                // Here, we only copy valid data.
                break;
            }
        }
        // Update the current file pointer to the read position + bytes read
        g_currentFilePointer.value = readpos + bytesActuallyRead;
        return bytesActuallyRead;
    } catch (e) {
        throw new Error("Bfile_ReadFile Error (localStorage): ", e.message);
    }
}

/**
 * Seeks to a position in the file.
 * Corresponds to Bfile_SeekFile or Bfile_SetPos (assuming SEEK_SET-like behavior).
 * @param {number} handle - The file handle.
 * @param {number} offset - The offset to seek to (from the beginning of the file).
 * @returns {number} 0 on success, -1 on error.
 */
function Bfile_SeekFile(handle, offset) {
    if (handle < 0 || !g_currentOpenFileKey.value) {
        throw new Error("Bfile_SeekFile: Invalid handle or no file open.");
        return -1;
    }
    // We could check if offset is valid against file size, but fseek often allows seeking
    // past EOF for writes.
    // const fileDataString = localStorage.getItem(g_currentOpenFileKey);
    // if (fileDataString) {
    //     const fileBytes = JSON.parse(fileDataString);
    //     if (offset < 0 || offset > fileBytes.length) { /* warning or error */ }
    // }
    g_currentFilePointer.value = offset;
    return 0; // Success (like fseek)
}

/**
 * Writes to a file at the current file pointer.
 * Corresponds to Bfile_WriteFile in C.
 * @param {number} handle - The file handle.
 * @param {number[]} data_arr - Array of bytes to write.
 * @param {number} len - The number of bytes to write from data_arr.
 * @returns {number} The number of bytes actually written.
 */
function Bfile_WriteFile(handle, data_arr, len) {
    if (handle < 0 || !g_currentOpenFileKey.value) {
        throw new Error("Bfile_WriteFile: Invalid handle or no file open.");
    }
    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    const fileDataString = localStorage.getItem(g_currentOpenFileKey.value);
    if (fileDataString === null) {
        throw new Error("Bfile_WriteFile: File key not found in localStorage.");
    }

    try {
        let fileBytes = JSON.parse(fileDataString);
        let bytesWritten = 0;

        console.log("Bfile_WriteFile: Writing to file", g_currentOpenFileKey.value, "at position", g_currentFilePointer.value, "with length", len, "data: ", JSON.stringify(data_arr));

        for (let i = 0; i < len; i++) {
            const currentWritePos = g_currentFilePointer.value + i;
            if (currentWritePos < fileBytes.length && i < data_arr.length) {
                fileBytes[currentWritePos] = data_arr[i];
                bytesWritten++;
            } else {
                // Writing past allocated size for a fixed-size file concept.
                // The C code implies a fixed size (180 bytes for sokobanU.sav).
                console.warn("Bfile_WriteFile: Attempting to write past pre-allocated file size or data_arr too short. Position:", currentWritePos, "File size:", fileBytes.length);
                break;
            }
        }

        if (bytesWritten > 0) {
            localStorage.setItem(g_currentOpenFileKey.value, JSON.stringify(fileBytes));
        }
        g_currentFilePointer.value += bytesWritten; // Update file pointer
        return bytesWritten;
    } catch (e) {
        throw new Error("Bfile_WriteFile Error (localStorage): ", e.message);
    }
}

// --- Key Input API ---
const IsKeyDown = (keyCode) => {
    return pressedKeys.value.has(keyCode);
};
const IsAnyKeyDown = () => {
    return pressedKeys.value.size > 0;
};
const ClearKeyBuffer = () => {
    pressedKeys.value.clear();
};

// --- Key Waiting Function ---
const GetKey = async () => {
    ML_display_vram();
    while (true) {

        // Return if any key is already pressed
        for (const key of keys) {
            if (pressedKeys.value.has(key)) {
                //Wait until key is released
                while (pressedKeys.value.has(key)) {
                    await Sleep(10); // Wait a bit to avoid busy loop
                }
                //console.log("GetKey: Key pressed:", key);
                return key;
            }
        }
        await Sleep(10);
    }
};


// --- Keyboard Event Handlers ---
const handleKeyDown = (event) => {
    // Prevent default browser action for keys we handle (e.g., arrow keys scrolling)
    if ([KEY_CTRL_UP_CONST, KEY_CTRL_DOWN_CONST, KEY_CTRL_LEFT_CONST, KEY_CTRL_RIGHT_CONST, KEY_CTRL_EXE_CONST, "Space"].includes(event.code)) {
        event.preventDefault();
    }
    let keyCode = event.code === "ShiftLeft" ? KEY_CTRL_EXE_CONST : event.code === "Space" ? KEY_CTRL_EXIT_CONST : event.code;
    pressedKeys.value.add(keyCode);
};

const handleKeyUp = (event) => {
    let keyCode = event.code === "ShiftLeft" ? KEY_CTRL_EXE_CONST : event.code === "Space" ? KEY_CTRL_EXIT_CONST : event.code;
    pressedKeys.value.delete(keyCode);
};

// --- On-Screen Button Handlers ---
const buttonDown = (keyCode) => {
    pressedKeys.value.add(keyCode);
};

const buttonUp = (keyCode) => {
    pressedKeys.value.delete(keyCode);
};

// --- Program Execution ---
const startProgram = async () => {
    if (isProgramRunning.value) return;
    isProgramRunning.value = true;

    const api = {
        ML_clear_vram,
        ML_pixel,
        ML_pixel_test,
        ML_display_vram,
        ML_horizontal_line,
        ML_vertical_line,
        ML_line,
        ML_point,
        ML_rectangle,
        ML_circle,
        ML_filled_circle,
        ML_bmp_or,
        ML_bmp_8_or,
        ML_bmp_16_or,
        ML_bmp_or_cl,
        ML_bmp_and,
        ML_bmp_and_cl,
        clearArea,
        Bdisp_AreaClr_VRAM,
        Bdisp_ReadArea_VRAM,
        Bdisp_AreaReverseVRAM,
        Bdisp_SetPoint_VRAM,
        Bdisp_DrawLineVRAM,
        Bdisp_AllClr_DDVRAM,
        Bdisp_PutDisp_DD,
        Bdisp_WriteGraph_VRAM,
        PopUpWin,
        IsKeyDown,
        IsAnyKeyDown,
        ClearKeyBuffer,
        GetKey,
        Sleep,
        Bfile_OpenFile,
        Bfile_CreateFile,
        Bfile_ReadFile,
        Bfile_SeekFile,
        Bfile_WriteFile,
        Bfile_CloseFile,
        Bfile_DeleteFile,
        PrintXY,
        PrintMini,
        dispStr,
        locate,
        Print,
        rand,
        SaveDisp,
        RestoreDisp,
        // Pass key constants to the program
        KEY_CTRL_UP: KEY_CTRL_UP_CONST,
        KEY_CTRL_DOWN: KEY_CTRL_DOWN_CONST,
        KEY_CTRL_LEFT: KEY_CTRL_LEFT_CONST,
        KEY_CTRL_RIGHT: KEY_CTRL_RIGHT_CONST,
        KEY_CTRL_EXE: KEY_CTRL_EXE_CONST,
        KEY_CTRL_EXIT: KEY_CTRL_EXIT_CONST,

        ML_TRANSPARENT,
        ML_WHITE,
        ML_BLACK,
        ML_XOR,
        ML_CHECKER,

        IMB_WRITEMODIFY_NORMAL,
        IMB_WRITEMODIFY_REVERCE,
        IMB_WRITEMODIFY_MESH,
        IMB_AREAKIND_OVER,
        IMB_AREAKIND_MESH,
        IMB_AREAKIND_CLR,
        IMB_AREAKIND_REVERSE,

        MINI_OR,
        MINI_REV,
        MINI_REVOR,
        MINI_OVER,
    };

    try {
        // The program prop is a factory function that receives the API
        // and should return an object with an AddIn_main method.
        programInstance = props.program(api);
        if (programInstance && typeof programInstance.AddIn_main === 'function') {
            // Call AddIn_main. It contains the main loop.
            // The loop in AddIn_main should check isProgramRunning or rely on component unmount to stop.
            // For this example, AddIn_main has `while(true)` and yields via `await ML_display_vram()`.
            // It will run until the component is unmounted or an error occurs.
            await programInstance.AddIn_main(0, 0); // Params as in C example
        } else {
            throw new Error("Program did not provide a valid AddIn_main function.");
        }
    } catch (error) {
        console.error("Error executing program:", error);
        errorMessage.value = "Error executing program: " + error.message;
    } finally {
        isProgramRunning.value = false; // Should ideally be set if AddIn_main returns/exits
    }
};

const stopProgram = () => {
    isProgramRunning.value = false; // Signal the loop in AddIn_main to stop (if it checks)
    // For robust stopping, AddIn_main should check isProgramRunning or similar flag.
    // In this setup, the loop might continue until ML_display_vram is called next,
    // or if it's a tight loop without await, it might not stop gracefully without being designed to.
    // However, onBeforeUnmount will clean up listeners.
};

const updateScale = async () => {
    await nextTick(); // Wait for DOM to update with new canvas size if it was reactive
    if (canvasCtx.value) {
        _renderVRAMToCanvas(); // Redraw with current VRAM content at new scale
    }
};

watch(currentScale, () => {
    updateScale();
});


onMounted(() => {
    if (emulatorCanvas.value) {
        canvasCtx.value = emulatorCanvas.value.getContext('2d');
    } else {
        throw new Error("Canvas element not found");
    }

    ML_clear_vram();
    _renderVRAMToCanvas(); // Initial render of empty screen

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (props.program) {
        startProgram();
    }

    //Add listeners to buttons
    document.querySelectorAll('button[keycode]').forEach(button => {
        button.addEventListener('mousedown', () => buttonDown(button.getAttribute('keycode')));
        button.addEventListener('mouseup', () => buttonUp(button.getAttribute('keycode')));
        button.addEventListener('mouseleave', () => buttonUp(button.getAttribute('keycode')));
        button.addEventListener("mouseenter", (e) => {
            if (e.buttons === 1) {
                buttonDown(button.getAttribute('keycode')); // Simulate button down if mouse is still pressed
            }
        });
        button.addEventListener('touchstart', () => buttonDown(button.getAttribute('keycode')));
        button.addEventListener('touchend', () => buttonUp(button.getAttribute('keycode')));
        button.addEventListener('touchcancel', () => buttonUp(button.getAttribute('keycode')));
        button.addEventListener('touchmove', (event) => {
            // Prevent scrolling on touch move
            event.preventDefault();
        });
        button.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent right-click context menu
        });
    });
});

onBeforeUnmount(() => {
    stopProgram();
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
});

</script>

<style scoped>
.calc-emulator-container {
    padding: 20px;
    border-radius: 8px;
    position: relative;
    height: 460px;
    z-index: 1;
    display: flex;
    justify-content: center;
}

.calculator-case {
    display: flex;
    margin: 20px auto;
    flex-direction: column;
    align-items: center;
    font-family: sans-serif;
    width: 325px;
    min-width: 325px;
    height: 415px;
    background-image: url("/calc-2.png");
    background-size: contain;
    background-repeat: no-repeat;
    filter: drop-shadow(0 4px 12px rgb(0, 0, 0, 0.15));
    z-index: 1;
    position: relative;
}

.calculator-screen {
    background-color: #C8D0C0;
    /* Default background, gets overdrawn */
    margin-bottom: 15px;
    image-rendering: pixelated;
    /* Ensures sharp pixels when scaled */
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    position: absolute;
    top: 114px;
    /* border: 25px solid #7f8878; */
    border: 25px solid #C8D0C0;
    z-index: 0;
}

@media (hover: none) {
    .arrows button {
        &::after {
            content: '';
            position: absolute;
            width: 104px;
            height: 104px;
            border-radius: 50%;
            pointer-events: none;
        }
        &.active::after {
            background: conic-gradient(
                rgba(0, 63, 78, 0) 30deg,
                rgba(0, 63, 78, 0.5) 90deg,
                rgba(0, 63, 78, 0) 150deg
            );
        }
        &:not(.active)::after {
            background: conic-gradient(
                rgba(0, 63, 78, 0) 45deg,
                rgba(0, 63, 78, 0.2) 90deg,
                rgba(0, 63, 78, 0) 135deg
            );
        }
    }
}

@media (hover: hover) {
    &:hover {
        &::after {
            content: '';
            position: absolute;
            width: 104px;
            height: 104px;
            border-radius: 50%;
            pointer-events: none;
        }
        &.active::after {
            background: conic-gradient(
                rgba(0, 63, 78, 0) 30deg,
                rgba(0, 63, 78, 0.5) 90deg,
                rgba(0, 63, 78, 0) 150deg
            );
        }
        &:not(.active)::after {
            background: conic-gradient(
                rgba(0, 63, 78, 0) 45deg,
                rgba(0, 63, 78, 0.2) 90deg,
                rgba(0, 63, 78, 0) 135deg
            );
        }
    }
}

.arrows {
    width: 150px;
    height: 150px;
    position: absolute;
    top: 248px;
    right: 30px;
    background-image: url("/arrows-2.png");
    background-size: contain;
    background-repeat: no-repeat;

    button {
        position: absolute;

        &.up {
            top: 9px;
            left: 28px;
            width: 120px;
            height: 60px;
            clip-path: polygon(0% 0%, 100% 0%, 50% 100%);

            &::after {
                left: 50%;
                bottom: 0;
                transform: translate(-50%, 50%) rotate(-90deg);
            }

        }
        &.down {
            top: 69px;
            left: 28px;
            width: 120px;
            height: 60px;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);

            &::after {
                left: 50%;
                top: 0;
                transform: translate(-50%, -50%) rotate(90deg);
            }
        }
        &.left {
            top: 9px;
            left: 28px;
            width: 60px;
            height: 120px;
            clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
            &::after {
                right: 0;
                top: 50%;
                transform: translate(50%, -50%) rotate(180deg);
            }
        }
        &.right {
            top: 9px;
            left: 88px;
            width: 60px;
            height: 120px;
            clip-path: polygon(100% 0%, 0% 50%, 100% 100%);

            &::after {
                left: 0;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
}

.exe {
    width: 70px;
    height: 50px;
    position: absolute;
    top: 265px;
    left: 35px;

    div {
        box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
        border-radius: 7px;
    }

    &:active div {
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
        transform: translate(1px, 1px);
        position: relative;
        img {
            mix-blend-mode: multiply;
        }
    }
}

.exit {
    width: 50px;
    height: 30px;
    position: absolute;
    top: 335px;
    left: 44px;

    div {
        box-shadow: 2px 2px 3px rgba(0,0,0,0.5);
        border-radius: 7px;
    }

    &:active div {
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
        transform: translate(1px, 1px);
        position: relative;
        img {
            mix-blend-mode: multiply;
        }
    }

}

.error-message {
    color: red;
    font-weight: bold;
    margin-bottom: 10px;
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
}

.control-row {
    display: flex;
    gap: 5px;
    justify-content: center;
}

.controls button {
    min-width: 50px;
    min-height: 35px;
    font-size: 16px;
    border: 1px solid #ccc;
    background-color: #535353;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    /* Prevent text selection on rapid clicks */
}

.controls button:active {
    background-color: rgb(41, 41, 41);
}

.scale-control {
    margin-top: 10px;
    font-size: 0.9em;
}

.scale-control input {
    width: 50px;
    margin-left: 5px;
}
</style>
