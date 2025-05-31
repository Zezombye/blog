
<template>
    <div class="calc-emulator-container">
        <canvas ref="emulatorCanvas" :width="canvasWidth" :height="canvasHeight" class="calculator-screen"></canvas>
        <div class="controls">
            <div class="control-row">
                <button @mousedown="buttonDown(KEY_CTRL_UP_CONST)" @mouseup="buttonUp(KEY_CTRL_UP_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_UP_CONST)">▲</button>
            </div>
            <div class="control-row">
                <button @mousedown="buttonDown(KEY_CTRL_LEFT_CONST)" @mouseup="buttonUp(KEY_CTRL_LEFT_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_LEFT_CONST)">◄</button>
                <button @mousedown="buttonDown(KEY_CTRL_EXE_CONST)" @mouseup="buttonUp(KEY_CTRL_EXE_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_EXE_CONST)">EXE</button>
                <button @mousedown="buttonDown(KEY_CTRL_RIGHT_CONST)" @mouseup="buttonUp(KEY_CTRL_RIGHT_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_RIGHT_CONST)">►</button>
            </div>
            <div class="control-row">
                <button @mousedown="buttonDown(KEY_CTRL_DOWN_CONST)" @mouseup="buttonUp(KEY_CTRL_DOWN_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_DOWN_CONST)">▼</button>
            </div>
            <div class="control-row">
                <button @mousedown="buttonDown(KEY_CTRL_F1_CONST)" @mouseup="buttonUp(KEY_CTRL_F1_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F1_CONST)">F1</button>
                <button @mousedown="buttonDown(KEY_CTRL_F2_CONST)" @mouseup="buttonUp(KEY_CTRL_F2_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F2_CONST)">F2</button>
                <button @mousedown="buttonDown(KEY_CTRL_F3_CONST)" @mouseup="buttonUp(KEY_CTRL_F3_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F3_CONST)">F3</button>
                <button @mousedown="buttonDown(KEY_CTRL_F4_CONST)" @mouseup="buttonUp(KEY_CTRL_F4_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F4_CONST)">F4</button>
                <button @mousedown="buttonDown(KEY_CTRL_F5_CONST)" @mouseup="buttonUp(KEY_CTRL_F5_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F5_CONST)">F5</button>
                <button @mousedown="buttonDown(KEY_CTRL_F6_CONST)" @mouseup="buttonUp(KEY_CTRL_F6_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_F6_CONST)">F6</button>
            </div>
            <div class="control-row">
                <button @mousedown="buttonDown(KEY_CTRL_SHIFT_CONST)" @mouseup="buttonUp(KEY_CTRL_SHIFT_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_SHIFT_CONST)">Shift</button>
                <button @mousedown="buttonDown(KEY_CTRL_EXIT_CONST)" @mouseup="buttonUp(KEY_CTRL_EXIT_CONST)"
                    @mouseleave="buttonUp(KEY_CTRL_EXIT_CONST)">Exit</button>
            </div>
        </div>
        <div class="scale-control">
            <label for="scale-input">Scale (1x-10x): </label>
            <input id="scale-input" type="number" v-model.number="currentScale" min="1" max="10"
                @change="updateScale" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';

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
const KEY_CTRL_EXE_CONST = 'Enter'; // Example for an EXE/Enter key
const KEY_CTRL_SHIFT_CONST = "ShiftLeft";
const KEY_CTRL_EXIT_CONST = "Escape";
const KEY_CTRL_F1_CONST = "F1";
const KEY_CTRL_F2_CONST = "F2";
const KEY_CTRL_F3_CONST = "F3";
const KEY_CTRL_F4_CONST = "F4";
const KEY_CTRL_F5_CONST = "F5";
const KEY_CTRL_F6_CONST = "F6";

const keys = [
    KEY_CTRL_UP_CONST,
    KEY_CTRL_DOWN_CONST,
    KEY_CTRL_LEFT_CONST,
    KEY_CTRL_RIGHT_CONST,
    KEY_CTRL_EXE_CONST,
    KEY_CTRL_SHIFT_CONST,
    KEY_CTRL_EXIT_CONST,
    KEY_CTRL_F1_CONST,
    KEY_CTRL_F2_CONST,
    KEY_CTRL_F3_CONST,
    KEY_CTRL_F4_CONST,
    KEY_CTRL_F5_CONST,
    KEY_CTRL_F6_CONST
];

const font_5x8 = [
    //Normal characters
    0,0,0,0,0,                            // Space
    0x0,0x6F,0x6F,0x0,0x0,                // !
    5,3,0,5,3,                            // "
    0x14,0x3E,0x14,0x3E,0x14,             // #
    0x2E,0x2A,0x7F,0x2A,0x3A,             // $
    0x43,0x33,0x8,0x66,0x61,              // %
    0x36,0x49,0x55,0x22,0x58,             // &
    0x0,0x5,0x3,0x0,0x0,                  // '
    0x0,0x3C,0x42,0x81,0x0,               // (
    0x0,0x81,0x42,0x3C,0x0,               // )
    0x28,0x10,0x7C,0x10,0x28,             // *
    0x08,0x08,0x3E,0x08,0x08,             // +
    0x0,0xA0,0x60,0x0,0x0,                // ,
    0x08,0x08,0x08,0x08,0x08,             // -
    0x0,0x60,0x60,0x0,0x0,                // .
    0xC0,0x30,0xC,0x3,0x0,                // /
    0x3E,0x51,0x49,0x45,0x3E,             // 0
    0x44,0x42,0x7F,0x40,0x40,             // 1
    0x42,0x61,0x51,0x49,0x46,             // 2
    0x22,0x41,0x49,0x49,0x36,             // 3
    0xF,0x8,0x8,0x8,0x7F,                 // 4
    0x27,0x45,0x45,0x45,0x39,             // 5
    0x3E,0x49,0x49,0x49,0x32,             // 6
    0x1,0x1,0x61,0x19,0x7,                // 7
    0x36,0x49,0x49,0x49,0x36,             // 8
    0x26,0x49,0x49,0x49,0x3E,             // 9
    0x0,0x36,0x36,0x0,0x0,                // :
    0x0,0x56,0x36,0x0,0x0,                // ;
    0x8,0x14,0x22,0x41,0x0,               // <
    0x14,0x14,0x14,0x14,0x14,             // =
    0x41,0x22,0x14,0x8,0x0,               // >
    0x2,0x1,0x51,0x9,0x6,                 // ?
    0x3C,0x42,0x5A,0x52,0x4C,             // @
    0x7E,0x9,0x9,0x9,0x7E,                // A
    0x7F,0x49,0x49,0x49,0x36,             // B
    0x3E,0x41,0x41,0x41,0x22,             // C
    0x7F,0x41,0x41,0x22,0x1C,             // D
    0x7F,0x49,0x49,0x49,0x49,             // E
    0x7F,0x9,0x9,0x9,0x9,                 // F
    0x3E,0x41,0x49,0x49,0x3A,             // G
    0x7F,0x8,0x8,0x8,0x7F,                // H
    0x41,0x41,0x7F,0x41,0x41,             // I
    0x31,0x41,0x41,0x3F,0x1,              // J
    0x7F,0x8,0x14,0x22,0x41,              // K
    0x7F,0x40,0x40,0x40,0x40,             // L
    0x7F,0x2,0x4,0x2,0x7F,                // M
    0x7F,0x2,0x4,0x8,0x7F,                // N
    0x3E,0x41,0x41,0x41,0x3E,             // O
    0x7F,0x9,0x9,0x9,0x6,                 // P
    0x3E,0x41,0x51,0x21,0x5E,             // Q
    0x7F,0x9,0x19,0x29,0x46,              // R
    0x26,0x49,0x49,0x49,0x32,             // S
    0x1,0x1,0x7F,0x1,0x1,                 // T
    0x3F,0x40,0x40,0x40,0x3F,             // U
    0xF,0x30,0x40,0x30,0xF,               // V
    0x1F,0x60,0x1C,0x60,0x1F,             // W
    0x63,0x14,0x8,0x14,0x63,              // X
    0x3,0x4,0x78,0x4,0x3,                 // Y
    0x61,0x51,0x49,0x45,0x43,             // Z
    0x0,0xFF,0x81,0x81,0x0,               // [
    0x3,0xC,0x30,0xC0,0x0,                // back slash
    0x0,0x81,0x81,0xFF,0x0,               // ]
    0x4,0x2,0x1,0x2,0x4,                  // ^
    0x40,0x40,0x40,0x40,0x40,             // _
    0x0,0x1,0x2,0x4,0x0,                  // `
    0x38,0x44,0x44,0x24,0x78,             // a
    0x7F,0x48,0x44,0x44,0x38,             // b
    0x38,0x44,0x44,0x44,0x44,             // c
    0x38,0x44,0x44,0x48,0x7F,             // d
    0x38,0x54,0x54,0x54,0x18,             // e
    0x8,0x8,0x7E,0x9,0x9,                 // f
    0x18,0xA4,0xA4,0xA4,0x78,             // g
    0x7F,0x8,0x4,0x4,0x78,                // h
    0x0,0x44,0x7D,0x40,0x0,               // i
    0x40,0x80,0x80,0x7D,0x0,              // j
    0x7F,0x10,0x28,0x44,0x0,              // k
    0x0,0x41,0x7F,0x40,0x0,               // l
    0x7C,0x4,0x78,0x4,0x78,               // m
    0x7C,0x8,0x4,0x4,0x78,                // n
    0x38,0x44,0x44,0x44,0x38,             // o
    0xFC,0x24,0x24,0x24,0x18,             // p
    0x18,0x24,0x24,0x24,0xF8,             // q
    0x7C,0x8,0x4,0x4,0x8,                 // r
    0x48,0x54,0x54,0x54,0x24,             // s
    0x4,0x4,0x3E,0x44,0x44,               // t
    0x3C,0x40,0x40,0x20,0x7C,             // u
    0x1C,0x20,0x40,0x20,0x1C,             // v
    0x1C,0x60,0x1C,0x60,0x1C,             // w
    0x44,0x28,0x10,0x28,0x44,             // x
    0x1C,0xA0,0xA0,0xA0,0x7C,             // y
    0x44,0x64,0x54,0x4C,0x44,             // z
    0x0,0x8,0x76,0x81,0x0,                // {
    0x0,0x0,0xFF,0x0,0x0,                 // |
    0x0,0x81,0x76,0x8,0x0,                // }
    0x8,0x4,0x8,0x10,0x8,                 // ~

    //Custom characters
    0x10,0x20,0x40,0x7E,0x2,              // Root symbol
    8,8,0x3E,0x1C,8,                      // Right arrow symbol from keypad
    0xFF,0xFF,0xFF,0xFF,0xFF,             // Solid block cursor
    //0x30,0x4E,0x49,0x39,0x6,              // Theta
    0x30,0x4C,0x2A,0x19,0x6,              // Theta
    0,5,2,5,0                             // Superscript X
];

const font_4x6 = [
    0b111110, 0b100010, 0b111110, 0, //0
    0, 0b111110, 0, 0, //1
    0b101110, 0b101010, 0b111010, 0, //2
    0b101010, 0b101010, 0b111110, 0, //3
    0b111000, 0b001000, 0b111110, 0, //4
    0b111010, 0b101010, 0b101110, 0, //5
    0b111110, 0b101010, 0b101110, 0, //6
    0b110000, 0b100000, 0b111110, 0, //7
    0b111110, 0b101010, 0b111110, 0, //8
    0b111010, 0b101010, 0b111110, 0, //9
    0b100000, 0b101010, 0b010000, 0, //?
]

const emulatorCanvas = ref(null);
const canvasCtx = ref(null);
const vram = ref(new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT));
const currentScale = ref(2); // Default scale
const pressedKeys = ref(new Set());
const isProgramRunning = ref(false);
const displayCursorX = ref(0);
const displayCursorY = ref(0);
let programInstance = null;

const canvasWidth = computed(() => SCREEN_WIDTH * currentScale.value);
const canvasHeight = computed(() => SCREEN_HEIGHT * currentScale.value);

// --- VRAM and Display API ---
const ML_clear_vram = () => {
    vram.value.fill(0);
};

const ML_pixel = (x, y, color) => { // color = 1 for ON, 0 for OFF
    if (typeof color !== 'number' || (color !== 0 && color !== 1 && color !== 2)) {
        throw new Error("ML_pixel: color must be 0, 1, or 2, got "+JSON.stringify(color));
    }
    if (x >= 0 && x < SCREEN_WIDTH && y >= 0 && y < SCREEN_HEIGHT) {
        vram.value[y * SCREEN_WIDTH + x] = color === 2 ? 1 - vram.value[y * SCREEN_WIDTH + x] : color;
    }
};

const ML_horizontal_line = (y, x1, x2, color) => {
    // Make sure y is within bounds
    if (y < 0 || y >= SCREEN_HEIGHT) return;

    // Ensure x1 <= x2
    if (x1 > x2) [x1, x2] = [x2, x1];

    // Clamp x values to screen bounds
    x1 = Math.max(0, Math.min(x1, SCREEN_WIDTH - 1));
    x2 = Math.max(0, Math.min(x2, SCREEN_WIDTH - 1));

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

    // Clamp y values to screen bounds
    y1 = Math.max(0, Math.min(y1, SCREEN_HEIGHT - 1));
    y2 = Math.max(0, Math.min(y2, SCREEN_HEIGHT - 1));

    // Draw the vertical line
    for (let y = y1; y <= y2; y++) {
        ML_pixel(x, y, color);
    }
};

const ML_line = (x1, y1, x2, y2, color) => {
    // Input validation and clipping could be added here

    // If it's a horizontal line, use the optimized function
    if (y1 === y2) {
        ML_horizontal_line(y1, x1, x2, color);
        return;
    }

    // If it's a vertical line, use the optimized function
    if (x1 === x2) {
        ML_vertical_line(x1, y1, y2, color);
        return;
    }

    // Bresenham algorithm for all other cases
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        // Plot the point if it's within bounds
        ML_pixel(x1, y1, color);

        // Check if we've reached the end point
        if (x1 === x2 && y1 === y2) break;

        // Calculate the next point
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
};

const PrintXY = (x, y, text, type) => {
    if (typeof text !== 'string') {
        throw new Error("PrintXY: text must be a string, got "+JSON.stringify(text));
    }
    //type: 0 = normal, 1 = reversed
    console.log(`Print at (${x}, ${y}): ${text} [Type: ${type}]`);
    for (let char of text) {
        let charCode = char.charCodeAt(0) - 32;
        if (charCode < 0 || charCode >= font_5x8.length / 5) {
            charCode = "?".charCodeAt(0) - 32; // Default to '?' if out of bounds
        }
        const bytes = font_5x8.slice(charCode * 5, charCode * 5 + 5);
        for (let i = 0; i < 5; i++) {
            const byte = bytes[i];
            for (let bit = 0; bit < 8; bit++) {
                if (byte & (1 << bit)) {
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
        throw new Error("PrintMini: text must be a string, got "+JSON.stringify(text));
    }
    if (type !== 0) {
        throw new Error("Unhandled PrintMini type: "+type);
    }
    console.log(`Print at (${x}, ${y}): ${text} [Type: ${type}]`);
    for (let char of text) {
        let charCode = char.charCodeAt(0) - 48;
        if (charCode < 0 || charCode >= (font_4x6.length / 4 - 1)) {
            charCode = 10; // Default to '?' if out of bounds
        }
        const bytes = font_4x6.slice(charCode * 4, charCode * 4 + 4);
        for (let i = 0; i < 4; i++) {
            const byte = bytes[i];
            for (let bit = 0; bit < 6; bit++) {
                if (byte & (1 << 5-bit)) {
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
    displayCursorX.value = max(1, min(x, 21));
    displayCursorY.value = max(1, min(y, 8));
    console.log(`Cursor moved to (${x}, ${y})`);
};
const Print = (text) => {
    if (typeof text !== 'string') {
        throw new Error("Print: text must be a string, got "+JSON.stringify(text));
    }
    PrintXY((displayCursorX.value-1)*6+1, (displayCursorY.value-1)*8, text, 0);
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

const Sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Global state for the "opened" file
const g_currentOpenFileKey = ref(-1); // Stores the localStorage key string for the currently "open" file
const g_currentFilePointer = ref(0);   // Current position for seek/write operations
const BFILE_PREFIX = "BFILE_FS_"; // Prefix to avoid collisions in localStorage

/**
 * Opens a file.
 * Corresponds to Bfile_OpenFile in C.
 * @param {number[]} filename_arr - Array of char codes for the filename.
 * @param {number} mode - The open mode (e.g., _OPENMODE_READWRITE).
 * @returns {number} A handle (1 for success, -1 for failure).
 */
function Bfile_OpenFile(path, mode) {
    if (typeof path !== "string") {
        throw new Error("Bfile_OpenFile: path must be a string, got "+JSON.stringify(path));
    }
    const key = BFILE_PREFIX + path;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    if (localStorage.getItem(key) !== null) {
        g_currentOpenFileKey.value = key;
        g_currentFilePointer.value = 0; // Reset pointer on open
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
        throw new Error("Bfile_CreateFile: path must be a string, got "+JSON.stringify(path));
    }
    const key = BFILE_PREFIX + path;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

    try {
        const content = Array(size).fill(2**16); // Initialize with all 1 because Casio
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
        return 0;
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
        return 0;
    }
}



// --- Key Input API ---
const IsKeyDown = (keyCode) => {
    return pressedKeys.value.has(keyCode);
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
                return key;
            }
        }
        await Sleep(10);
    }
};


// --- Keyboard Event Handlers ---
const handleKeyDown = (event) => {
    // Prevent default browser action for keys we handle (e.g., arrow keys scrolling)
    if ([KEY_CTRL_UP_CONST, KEY_CTRL_DOWN_CONST, KEY_CTRL_LEFT_CONST, KEY_CTRL_RIGHT_CONST, KEY_CTRL_EXE_CONST].includes(event.code)) {
        event.preventDefault();
    }
    pressedKeys.value.add(event.code);
};

const handleKeyUp = (event) => {
    pressedKeys.value.delete(event.code);
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
        ML_display_vram,
        ML_horizontal_line,
        ML_vertical_line,
        ML_line,
        Bdisp_AreaClr_VRAM,
        Bdisp_AreaReverseVRAM,
        IsKeyDown,
        GetKey,
        Sleep,
        Bfile_OpenFile,
        Bfile_CreateFile,
        Bfile_ReadFile,
        Bfile_SeekFile,
        Bfile_WriteFile,
        PrintXY,
        PrintMini,
        locate,
        Print,
        // Pass key constants to the program
        KEY_CTRL_UP: KEY_CTRL_UP_CONST,
        KEY_CTRL_DOWN: KEY_CTRL_DOWN_CONST,
        KEY_CTRL_LEFT: KEY_CTRL_LEFT_CONST,
        KEY_CTRL_RIGHT: KEY_CTRL_RIGHT_CONST,
        KEY_CTRL_EXE: KEY_CTRL_EXE_CONST,
        KEY_CTRL_SHIFT: KEY_CTRL_SHIFT_CONST,
        KEY_CTRL_EXIT: KEY_CTRL_EXIT_CONST,
        KEY_CTRL_F1: KEY_CTRL_F1_CONST,
        KEY_CTRL_F2: KEY_CTRL_F2_CONST,
        KEY_CTRL_F3: KEY_CTRL_F3_CONST,
        KEY_CTRL_F4: KEY_CTRL_F4_CONST,
        KEY_CTRL_F5: KEY_CTRL_F5_CONST,
        KEY_CTRL_F6: KEY_CTRL_F6_CONST,
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
        return;
    }

    ML_clear_vram();
    _renderVRAMToCanvas(); // Initial render of empty screen

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (props.program) {
        startProgram();
    }
});

onBeforeUnmount(() => {
    stopProgram();
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
});

</script>

<style scoped>
.calc-emulator-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: sans-serif;
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: fit-content;
    margin: 20px auto;
}

.calculator-screen {
    border: 2px solid #555;
    background-color: #C8D0C0;
    /* Default background, gets overdrawn */
    margin-bottom: 15px;
    image-rendering: pixelated;
    /* Ensures sharp pixels when scaled */
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
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
