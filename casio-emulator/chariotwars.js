
export default function chariotwars({

    KEY_CTRL_LEFT,
    KEY_CTRL_RIGHT,
    KEY_CTRL_UP,
    KEY_CTRL_DOWN,
    KEY_CTRL_EXIT,
    KEY_CTRL_F1,
    KEY_CTRL_F2,
    KEY_CTRL_F3,
    KEY_CTRL_F6,
    KEY_CTRL_SHIFT,
    KEY_CTRL_SPACE,
    KEY_CTRL_EXE: KEY_CTRL_EXE,
    _OPENMODE_READWRITE,
    Bdisp_AreaClr_VRAM,
    ML_horizontal_line,
    ML_vertical_line,
    ML_pixel,
    ML_line,
    ML_rectangle,
    ML_bmp_or,
    ML_bmp_or_cl,
    ML_clear_vram,
    ML_BLACK,
    ML_WHITE,
    clearArea,
    GetKey,
    IsKeyDown: isKeyDown,
    IsAnyKeyDown: isAnyKeyDown,
    ClearKeyBuffer: clearKeyBuffer,
    PrintXY,
    PrintMini,
    Bdisp_AreaReverseVRAM,
    PopUpWin,
    locate,
    Print,
    dispStr,
    rand,
    ML_display_vram,
    Bfile_OpenFile,
    Bfile_ReadFile,
    Bfile_SeekFile,
    Bfile_WriteFile,
    Bfile_CreateFile,
    Sleep,
}) {

const KEY_EXE = KEY_CTRL_EXE;
const KEY_SHIFT = KEY_CTRL_SHIFT;
const KEY_LEFT = KEY_CTRL_LEFT;
const KEY_RIGHT = KEY_CTRL_RIGHT;
const KEY_UP = KEY_CTRL_UP;
const KEY_DOWN = KEY_CTRL_DOWN;
const KEY_F6 = KEY_CTRL_F6;

// Player structure (assumed based on usage)
class Player {
    constructor() {
        this.posX = 0.0;
        this.posY = 0.0;
        this.speed = 0.0;
        this.pushForce = 0.0;
    }
}

// Constants (assumed values, or to be defined if known)
const SPRITE_WIDTH = 29;  // Example value, deduced from sprite data and usage
const SPRITE_HEIGHT = 11; // Example value, deduced from sprite data and usage
const SPRITE_SIZE = 40;   // (SPRITE_WIDTH * SPRITE_HEIGHT) / 8 for 1bpp. (16*20)/8 = 40. Matches sprite array sizes.
const START_POS = 20;     // Example value

// Direction enum
const Direction = {
    BACKWARDS: -1,
    LEFT: 0,
    FORWARDS: 1,
    RIGHT: 2,
};

// LevelState enum
const LevelState = {
    NEW_LVL: 0,
    RESTART_LVL: 1
};

// Game state constants
const RUNNING = 0;
const FINISHED = 1;

// Key press state constants
const NOT_PRESSED = 0;
const PRESSED = 1;
const STILL_PRESSED = 2;

// Zone type constants
const BST = -1;
const NZ = 0;
const SZ = 1;
const BZ = 2;
const BSZ = 3;

const defaultSprite = [0xff, 0xc0, 0xff, 0xc0, 0x1, 0x88, 0x3, 0xc3, 0xc2, 0x41, 0xee, 0x39, 0x9, 0xff, 0x82, 0x24, 0x78, 0x3, 0x15, 0x3f, 0xff, 0xf4, 0x89, 0x1e, 0x0, 0xc3, 0x90, 0x9f, 0xf8, 0xf, 0x9, 0x7, 0xb8, 0x1, 0x88, 0x3, 0xff, 0xf0, 0x3f, 0xf0];

let playerSprite = [0xff, 0xc0, 0xff, 0xc0, 0x1, 0x8f, 0xff, 0xc3, 0xc2, 0x7f, 0xfe, 0x39, 0x9, 0xff, 0x82, 0x24, 0x78, 0x3, 0x15, 0x3f, 0xff, 0xf4, 0x89, 0x1e, 0x0, 0xc3, 0x90, 0x9f, 0xf8, 0xf, 0x9, 0xff, 0xf8, 0x1, 0x8f, 0xff, 0xff, 0xf0, 0x3f, 0xf0];

const zezombus = [0, 0, 0, 0, 0, 63, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 198, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 134, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 70, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 70, 32, 128, 0, 0, 0, 0, 0, 0, 0, 0, 40, 70, 32, 192, 0, 0, 0, 0, 0, 0, 0, 0, 68, 63, 193, 32, 0, 0, 0, 0, 0, 0, 0, 0, 130, 102, 98, 16, 0, 0, 0, 0, 0, 0, 0, 1, 129, 134, 20, 16, 0, 0, 0, 0, 0, 0, 0, 1, 97, 6, 8, 56, 0, 0, 0, 0, 0, 0, 0, 2, 26, 6, 4, 196, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 7, 4, 0, 0, 0, 0, 0, 0, 0, 6, 4, 6, 2, 4, 0, 0, 0, 0, 0, 0, 0, 5, 228, 6, 2, 30, 0, 0, 0, 0, 0, 0, 0, 4, 24, 6, 1, 226, 0, 0, 0, 0, 0, 0, 0, 4, 8, 31, 129, 2, 0, 0, 0, 0, 0, 0, 0, 7, 248, 63, 193, 254, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 15, 255, 255, 6, 0, 0, 0, 0, 0, 0, 0, 7, 240, 0, 0, 254, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 3, 128, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 1, 128, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 32, 15, 0, 15, 0, 128, 0, 0, 0, 0, 0, 0, 32, 48, 192, 112, 192, 64, 0, 0, 0, 0, 0, 0, 64, 64, 63, 128, 32, 64, 0, 0, 0, 0, 0, 0, 79, 135, 153, 15, 31, 64, 0, 0, 0, 0, 0, 0, 127, 128, 201, 56, 31, 224, 0, 0, 0, 0, 0, 0, 63, 248, 9, 1, 255, 192, 0, 0, 0, 0, 0, 0, 31, 207, 201, 31, 63, 128, 0, 0, 0, 0, 0, 0, 31, 137, 112, 233, 31, 128, 0, 0, 0, 0, 0, 0, 31, 4, 32, 66, 15, 0, 0, 0, 0, 0, 0, 0, 31, 3, 192, 60, 15, 0, 0, 0, 0, 0, 0, 0, 15, 128, 0, 0, 31, 0, 0, 0, 0, 0, 0, 0, 7, 227, 192, 60, 126, 0, 0, 0, 0, 0, 0, 0, 7, 240, 128, 32, 254, 0, 0, 0, 0, 0, 0, 0, 23, 240, 128, 32, 254, 128, 0, 0, 0, 0, 0, 0, 23, 224, 128, 32, 126, 128, 0, 0, 0, 0, 0, 0, 31, 128, 128, 32, 63, 128, 0, 0, 0, 0, 0, 0, 127, 67, 64, 56, 127, 248, 0, 0, 0, 0, 0, 7, 159, 124, 32, 71, 175, 135, 128, 0, 0, 0, 0, 120, 31, 64, 31, 128, 47, 128, 112, 0, 0, 0, 7, 128, 30, 64, 6, 0, 39, 128, 15, 0, 0, 0, 28, 0, 30, 64, 4, 0, 39, 128, 1, 192, 0, 0, 96, 0, 15, 64, 10, 0, 71, 0, 0, 48, 0, 3, 128, 0, 255, 48, 9, 0, 143, 240, 0, 14, 0, 4, 0, 15, 7, 15, 240, 255, 15, 15, 0, 1, 0, 8, 0, 60, 7, 131, 224, 60, 14, 0, 224, 0, 128, 12, 1, 222, 3, 192, 0, 0, 30, 0, 252, 1, 128, 18, 6, 14, 3, 254, 0, 1, 252, 1, 227, 2, 64, 33, 24, 7, 1, 252, 0, 0, 248, 1, 192, 196, 32, 64, 252, 7, 128, 248, 0, 0, 112, 3, 193, 248, 16, 192, 63, 3, 128, 255, 255, 255, 240, 3, 131, 224, 24, 128, 47, 131, 192, 131, 192, 120, 16, 7, 135, 160, 8, 128, 39, 225, 192, 131, 128, 56, 16, 7, 31, 32, 8, 128, 33, 241, 224, 65, 192, 112, 32, 15, 62, 32, 8];

const dialogTop = [3, 255, 255, 255, 255, 255, 0, 12, 0, 0, 0, 0, 0, 128, 16, 0, 0, 0, 0, 0, 96, 32, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 8, 128, 0, 0, 0, 0, 0, 8, 128, 0, 0, 0, 0, 0, 8];

const dialogBottom = [4, 0, 0, 0, 0, 0, 0, 64, 4, 0, 0, 0, 0, 0, 0, 64, 4, 0, 0, 0, 0, 0, 0, 64, 24, 0, 0, 0, 0, 0, 0, 64, 32, 0, 0, 0, 0, 0, 0, 64, 192, 0, 0, 0, 0, 0, 0, 64, 32, 0, 0, 0, 0, 0, 0, 64, 24, 0, 0, 0, 0, 0, 0, 64, 4, 0, 0, 0, 0, 0, 0, 64, 4, 0, 0, 0, 0, 0, 0, 64, 2, 0, 0, 0, 0, 0, 0, 64, 2, 0, 0, 0, 0, 0, 0, 128, 1, 0, 0, 0, 0, 0, 1, 0, 0, 192, 0, 0, 0, 0, 6, 0, 0, 60, 0, 0, 0, 0, 120, 0, 0, 3, 255, 255, 255, 255, 128, 0];

const fistBottom = [0x0, 0x3c, 0x0, 0x0, 0x0, 0x1f, 0x0, 0x66, 0x0, 0x0, 0x0, 0x1f, 0x0, 0x81, 0x1f, 0x0, 0x0, 0x1f, 0x1, 0x0, 0xe0, 0x80, 0x0, 0x1f, 0x3, 0x0, 0xc0, 0xcf, 0x0, 0x1f, 0x2, 0x0, 0x80, 0x51, 0x80, 0x1f, 0x1, 0x0, 0x80, 0x60, 0x40, 0x1f, 0x1f, 0xc0, 0x80, 0x60, 0x5e, 0x1f, 0x20, 0x7f, 0xc0, 0x40, 0x63, 0x1f, 0x20, 0x10, 0xa0, 0x40, 0x41, 0x1f, 0x40, 0x18, 0xa0, 0x40, 0x40, 0x9f, 0x40, 0x7, 0x20, 0x40, 0x40, 0x9f, 0x40, 0x0, 0x40, 0x80, 0x80, 0x9f, 0x42, 0x0, 0x40, 0x80, 0x81, 0x5f, 0x41, 0x1, 0x80, 0x80, 0x81, 0x5f, 0x80, 0xc7, 0x80, 0x81, 0x1, 0x5f, 0x80, 0x3f, 0xc1, 0x81, 0x3, 0xdf, 0x80, 0x3b, 0xff, 0x83, 0x3, 0xff, 0x80, 0x70, 0x7e, 0xf7, 0x86, 0x7f, 0x80, 0xe0, 0x3f, 0xff, 0xfc, 0x3f, 0x83, 0x60, 0x1d, 0xff, 0xfc, 0x3f, 0x80, 0xa0, 0x6, 0x7d, 0xfb, 0xbf, 0x80, 0x20, 0x2, 0x37, 0xfc, 0x7f, 0x80, 0x40, 0x3, 0x12, 0x0, 0x5f, 0xc0, 0x0, 0x1, 0x92, 0x0, 0x5f, 0x40, 0x0, 0x0, 0x89, 0x0, 0x5f, 0x60, 0x0, 0x0, 0xc8, 0x0, 0x5f, 0x20, 0x0, 0x0, 0x48, 0x0, 0x5f, 0x30, 0x0, 0x0, 0x44, 0x0, 0x5f, 0x18, 0x0, 0x0, 0x44, 0x0, 0x5f, 0xc, 0x0, 0x0, 0x20, 0x0, 0x5f, 0x6, 0x0, 0x0, 0x20, 0x0, 0x5f, 0x7, 0x0, 0x0, 0x0, 0x0, 0xdf, 0x3, 0x80, 0x0, 0x0, 0x1, 0x9f, 0x1, 0x80, 0x0, 0x0, 0x1, 0x9f, 0x0, 0xc0, 0x0, 0x0, 0x1, 0x1f, 0x0, 0xe0, 0x0, 0x0, 0xf, 0x1f, 0x0, 0x70, 0x0, 0x0, 0x3, 0x1f, 0x0, 0x3c, 0x0, 0x40, 0x2, 0x1f, 0x0, 0x1e, 0x0, 0x80, 0x6, 0x1f, 0x0, 0xf, 0x3, 0x0, 0xe, 0x1f, 0x0, 0xe, 0x9c, 0x0, 0x7e, 0x1f, 0x0, 0xc, 0x0, 0x3f, 0xce, 0x1f, 0x0, 0xc, 0x0, 0x0, 0xc, 0x1f, 0x0, 0xc, 0x0, 0x0, 0xc, 0x1f, 0x0, 0xc, 0x0, 0x0, 0xc, 0x1f, 0x0, 0xc, 0x0, 0x0, 0xc, 0x1f, 0x0, 0xc, 0x0, 0x0, 0xc, 0x1f, 0x0, 0xc, 0x0, 0x0, 0x4, 0x1f, 0x0, 0xc, 0x0, 0x0, 0x4, 0x1f, 0x0, 0xc, 0x0, 0x0, 0x4, 0x1f, 0x0, 0xc, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, 0x0, 0x8, 0x0, 0x0, 0x4, 0x1f, ];

const fistRight = [0x0, 0x1, 0xff, 0x80, 0x0, 0x0, 0x0, 0x0, 0x3, 0x0, 0x3e, 0x0, 0xe0, 0x0, 0x0, 0x0, 0x0, 0x3, 0x0, 0xc0, 0x0, 0x38, 0x0, 0x0, 0x0, 0x0, 0x3, 0x1, 0x0, 0x0, 0xc, 0x0, 0x0, 0x0, 0x0, 0x3, 0x1, 0x0, 0x0, 0x6, 0x0, 0x0, 0x0, 0x0, 0x3, 0x1, 0x0, 0x0, 0x3, 0x80, 0x0, 0x0, 0x0, 0x3, 0xd, 0x4, 0x8, 0x1, 0xc0, 0x0, 0x0, 0x0, 0x3, 0x1b, 0x2, 0x8, 0x0, 0xe0, 0x0, 0x0, 0x0, 0x3, 0x21, 0x1, 0x14, 0x0, 0x78, 0x0, 0x0, 0x0, 0x3, 0x41, 0x81, 0x39, 0x0, 0x1c, 0x0, 0x0, 0x0, 0x3, 0xc0, 0x80, 0xfe, 0x0, 0xe, 0x0, 0x0, 0x0, 0x3, 0x80, 0xe0, 0xe0, 0x0, 0x7, 0x0, 0x0, 0x0, 0x3, 0x80, 0xa0, 0xc0, 0x0, 0x3, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x91, 0x80, 0x0, 0x3, 0xff, 0xf0, 0x0, 0x3, 0x40, 0x91, 0xc0, 0x0, 0x1, 0xc0, 0x0, 0x0, 0x3, 0x20, 0x93, 0xc0, 0x0, 0x0, 0x80, 0x0, 0x0, 0x3, 0x1f, 0xe3, 0xc0, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x18, 0x8c, 0xe0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x3, 0x10, 0x70, 0x70, 0x0, 0x0, 0x0, 0x0, 0x0, 0x3, 0x20, 0x0, 0x78, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x20, 0x0, 0x78, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x20, 0x0, 0x7c, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x20, 0x0, 0x77, 0x0, 0x0, 0x80, 0x0, 0x0, 0x3, 0x20, 0x0, 0xd9, 0x80, 0x0, 0x80, 0x0, 0x0, 0x3, 0x18, 0xf, 0xf8, 0xe0, 0x1, 0x0, 0x0, 0x0, 0x3, 0xf, 0xf0, 0x3c, 0x3c, 0x2, 0x0, 0x0, 0x0, 0x3, 0x3, 0x0, 0x3e, 0x3, 0x0, 0x20, 0x0, 0x0, 0x3, 0x4, 0x0, 0x3f, 0x80, 0x0, 0x20, 0x0, 0x0, 0x3, 0x8, 0x0, 0x1c, 0x70, 0x0, 0x20, 0x0, 0x0, 0x3, 0x8, 0x0, 0x3e, 0xc, 0x0, 0x20, 0x0, 0x0, 0x3, 0x8, 0x0, 0x7b, 0x80, 0x0, 0x20, 0x0, 0x0, 0x3, 0xc, 0x1, 0xfe, 0x40, 0x0, 0x20, 0x0, 0x0, 0x3, 0x4, 0xe, 0x3e, 0x0, 0x0, 0x20, 0x0, 0x0, 0x3, 0x3, 0xf0, 0x1e, 0x0, 0x0, 0x60, 0x0, 0x0, 0x3, 0x0, 0x80, 0x1e, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x1, 0x0, 0x1e, 0x0, 0x0, 0x40, 0x0, 0x0, 0x3, 0x1, 0x0, 0x1e, 0x0, 0x8, 0xff, 0x0, 0x0, 0x3, 0x1, 0x0, 0x3a, 0x0, 0x9, 0xff, 0xff, 0xff, 0xff, 0x1, 0x80, 0xe4, 0x0, 0xf, 0xe0, 0x0, 0x0, 0x3, 0x0, 0xc7, 0xc4, 0x0, 0x7c, 0x0, 0x0, 0x0, 0x3, 0x0, 0x38, 0xc4, 0x0, 0xe0, 0x0, 0x0, 0x0, 0x3, 0x0, 0x7, 0xe3, 0xff, 0x80, 0x0, 0x0, 0x0, 0x3, 0x0, 0x0, 0x7e, 0x0, 0x0, 0x0, 0x0, 0x0, 0x3];

const fistLeft = [0x0, 0x0, 0x0, 0x0, 0x0, 0x7, 0xfe, 0x0, 0x3, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1c, 0x1, 0xf0, 0x3, 0x0, 0x0, 0x0, 0x0, 0x0, 0x70, 0x0, 0xc, 0x3, 0x0, 0x0, 0x0, 0x0, 0x0, 0xc0, 0x0, 0x2, 0x3, 0x0, 0x0, 0x0, 0x0, 0x1, 0x80, 0x0, 0x2, 0x3, 0x0, 0x0, 0x0, 0x0, 0x7, 0x0, 0x0, 0x2, 0x3, 0x0, 0x0, 0x0, 0x0, 0xe, 0x0, 0x40, 0x82, 0xc3, 0x0, 0x0, 0x0, 0x0, 0x1c, 0x0, 0x41, 0x3, 0x63, 0x0, 0x0, 0x0, 0x0, 0x78, 0x0, 0xa2, 0x2, 0x13, 0x0, 0x0, 0x0, 0x0, 0xe0, 0x2, 0x72, 0x6, 0xb, 0x0, 0x0, 0x0, 0x1, 0xc0, 0x1, 0xfc, 0x4, 0xf, 0x0, 0x0, 0x0, 0x3, 0x80, 0x0, 0x1c, 0x1c, 0x7, 0xff, 0xff, 0xff, 0xff, 0x0, 0x0, 0xc, 0x14, 0x7, 0x0, 0x0, 0x3f, 0xff, 0x0, 0x0, 0x6, 0x24, 0xf, 0x0, 0x0, 0x0, 0xe, 0x0, 0x0, 0xe, 0x24, 0xb, 0x0, 0x0, 0x0, 0x4, 0x0, 0x0, 0xf, 0x24, 0x13, 0x0, 0x0, 0x0, 0x8, 0x0, 0x0, 0xf, 0x1f, 0xe3, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1c, 0xc4, 0x63, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x38, 0x38, 0x23, 0x0, 0x0, 0x0, 0x8, 0x0, 0x0, 0x78, 0x0, 0x13, 0x0, 0x0, 0x0, 0x8, 0x0, 0x0, 0x78, 0x0, 0x13, 0x0, 0x0, 0x0, 0x8, 0x0, 0x0, 0xf8, 0x0, 0x13, 0x0, 0x0, 0x0, 0x4, 0x0, 0x3, 0xb8, 0x0, 0x13, 0x0, 0x0, 0x0, 0x4, 0x0, 0x6, 0x6c, 0x0, 0x13, 0x0, 0x0, 0x0, 0x2, 0x0, 0x1c, 0x7f, 0xc0, 0x63, 0x0, 0x0, 0x0, 0x1, 0x0, 0xf0, 0xf0, 0x3f, 0xc3, 0x0, 0x0, 0x0, 0x10, 0x3, 0x1, 0xf0, 0x3, 0x3, 0x0, 0x0, 0x0, 0x10, 0x0, 0x7, 0xf0, 0x0, 0x83, 0x0, 0x0, 0x0, 0x10, 0x0, 0x38, 0xe0, 0x0, 0x43, 0x0, 0x0, 0x0, 0x10, 0x0, 0xc1, 0xf0, 0x0, 0x43, 0x0, 0x0, 0x0, 0x10, 0x0, 0x7, 0x78, 0x0, 0x43, 0x0, 0x0, 0x0, 0x10, 0x0, 0x9, 0xfe, 0x0, 0xc3, 0x0, 0x0, 0x0, 0x10, 0x0, 0x1, 0xf1, 0xc0, 0x83, 0x0, 0x0, 0x0, 0x18, 0x0, 0x1, 0xe0, 0x3f, 0x3, 0x0, 0x0, 0x0, 0x8, 0x0, 0x1, 0xe0, 0x4, 0x3, 0x0, 0x0, 0x0, 0x8, 0x0, 0x1, 0xe0, 0x2, 0x3, 0x0, 0x0, 0x3, 0xfc, 0x40, 0x1, 0xe0, 0x2, 0x3, 0xff, 0xff, 0xff, 0xfe, 0x40, 0x1, 0x70, 0x2, 0x3, 0x0, 0x0, 0x0, 0x1f, 0xc0, 0x0, 0x9c, 0x6, 0x3, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x0, 0x8f, 0x8c, 0x3, 0x0, 0x0, 0x0, 0x0, 0x1c, 0x0, 0x8c, 0x70, 0x3, 0x0, 0x0, 0x0, 0x0, 0x7, 0xff, 0x1f, 0x80, 0x3, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0xf8, 0x0, 0x3];

const fistTop = [0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x2, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x4, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x6, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x6, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x6, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x6, 0x0, 0x0, 0x6, 0x0, 0x1f, 0x6, 0x0, 0x0, 0x6, 0x0, 0x1f, 0xe, 0x7f, 0x80, 0x6, 0x0, 0x1f, 0xf, 0xc0, 0x7, 0x2e, 0x0, 0x1f, 0xe, 0x0, 0x18, 0x1e, 0x0, 0x1f, 0xc, 0x0, 0x20, 0xf, 0x0, 0x1f, 0x8, 0x0, 0x40, 0x7, 0x80, 0x1f, 0x18, 0x0, 0x0, 0x1, 0xc0, 0x1f, 0x1e, 0x0, 0x0, 0x0, 0xe0, 0x1f, 0x10, 0x0, 0x0, 0x0, 0x60, 0x1f, 0x30, 0x0, 0x0, 0x0, 0x30, 0x1f, 0x30, 0x0, 0x0, 0x0, 0x38, 0x1f, 0x60, 0x0, 0x0, 0x0, 0x1c, 0x1f, 0x40, 0x0, 0x80, 0x0, 0xc, 0x1f, 0x40, 0x0, 0x80, 0x0, 0x6, 0x1f, 0x40, 0x4, 0x40, 0x0, 0x3, 0x1f, 0x40, 0x4, 0x40, 0x0, 0x1, 0x9f, 0x40, 0x2, 0x40, 0x0, 0x0, 0x9f, 0x40, 0x2, 0x60, 0x0, 0x0, 0xdf, 0x40, 0x12, 0x20, 0x0, 0x0, 0x5f, 0x40, 0x9, 0x30, 0x0, 0x0, 0x7f, 0x40, 0x9, 0x18, 0x0, 0x40, 0x3f, 0xc7, 0xfd, 0x88, 0x0, 0x80, 0x3f, 0xbb, 0xf7, 0xcc, 0x0, 0xa0, 0x3f, 0x87, 0xff, 0xf7, 0x0, 0xd8, 0x3f, 0x87, 0xff, 0xff, 0x80, 0xe0, 0x3f, 0xcc, 0x3d, 0xef, 0xc1, 0xc0, 0x3f, 0xf8, 0x18, 0x3f, 0xfb, 0x80, 0x3f, 0x78, 0x10, 0x30, 0x7f, 0x80, 0x3f, 0x50, 0x10, 0x20, 0x3c, 0x60, 0x3f, 0x50, 0x20, 0x20, 0x30, 0x10, 0x5f, 0x50, 0x20, 0x20, 0x40, 0x8, 0x5f, 0x20, 0x20, 0x20, 0x40, 0x0, 0x5f, 0x20, 0x40, 0x40, 0x9c, 0x0, 0x5f, 0x20, 0x40, 0x40, 0xa3, 0x0, 0x5f, 0x10, 0x40, 0x40, 0xa1, 0x0, 0x9f, 0x18, 0xc0, 0x40, 0x7f, 0xc0, 0x9f, 0xf, 0x40, 0xc0, 0x20, 0x7f, 0x1f, 0x0, 0x40, 0xc0, 0x20, 0x10, 0x1f, 0x0, 0x31, 0x40, 0x20, 0x8, 0x1f, 0x0, 0x1e, 0x60, 0x60, 0x18, 0x1f, 0x0, 0x0, 0x20, 0xe0, 0x10, 0x1f, 0x0, 0x0, 0x1f, 0x10, 0x20, 0x1f, 0x0, 0x0, 0x0, 0xc, 0xc0, 0x1f, 0x0, 0x0, 0x0, 0x7, 0x80, 0x1f];

const logo = [0x2a, 0x4c, 0xbb, 0xff, 0x4a, 0xaa, 0xa9, 0x7f, 0x8e, 0xec, 0xa9, 0x7f, 0x4a, 0xaa, 0xa9, 0x7f, 0x2a, 0xaa, 0xb9, 0x7f, 0x0, 0x0, 0x0, 0x7f, 0x0, 0x0, 0x4, 0x7f, 0x15, 0x49, 0x88, 0x7f, 0x12, 0x55, 0x50, 0x7f, 0x15, 0x5d, 0x88, 0x7f, 0x18, 0xd5, 0x44, 0x7f, 0x10, 0x55, 0x48, 0x7f, 0x0, 0x0, 0x10, 0x7f];

let bots = Array(6).fill(null).map(() => new Player());
let player = new Player();

let gameState;
let playerRank = 0;
let lvl = 0;
let nbBots = 5;
let isNewGame = true;
//int fileHandle;
let currentMap;

const romanNumerals = ["I  ", "II ", "III", "IV ", "V  ", "VI"];
const pressingLevel = ["\xE6\xA6\xE6\xA5\xE6\xA5", "\xE6\xA6\xE6\xA6\xE6\xA5", "\xE6\xA6\xE6\xA6\xE6\xA6"];

async function AddIn_main(isAppli, OptionNum) {
	let key; // unsigned int
	let i;

    if (typeof localStorage === 'undefined') {
        throw new Error("localStorage is not available.");
    }

	if (localStorage.getItem("chariotwars") === null) {
		localStorage.setItem("chariotwars", "0");
		isNewGame = true;
	} else {
		lvl = parseInt(localStorage.getItem("chariotwars"), 10);
		isNewGame = false;
	}

	//Menu loop
	while (1) {

		await dispMenu();
		await setLvl(lvl, LevelState.NEW_LVL);

		//Game loop
		while (1) {

			if (lvl > 8) {
				break;
			}

			gameState = RUNNING;

			playerRank = 1;

			await play();

			if (lvl == 0 && playerRank > 1) {
				await dialogMenu("Comment cela, soldat? Vous \x89chouez \x91 l'entraine- ment? C'est inacceptable!", true);
				await setLvl(0, LevelState.RESTART_LVL);
			} else if (lvl == 1 && playerRank > 2) {
				await dialogMenu("Soldat, je sais que vous etes d\x89butant et que les chevaux sont ceux d'un paysan, mais je vous ai demand\x89 d'etre au moins deuxi\x90me ! Reprenez la course de ce pas !", true);
				await setLvl(1, LevelState.RESTART_LVL);
			} else if (lvl == 2 && playerRank > 1) {
				await dialogMenu("Soldat! J'ai d\x89pens\x89 MXVII sesterces pour vous acheter des bons chevaux ! Ne faites pas faille au camp de Planeta Casius ! Gagnez cette course !", true);
				await setLvl(2, LevelState.RESTART_LVL);
			} else if (lvl == 3 && playerRank > 1) {
				await dialogMenu("Vous etes \x91 la coupe du monde, soldat! Du nerf!", true);
				await setLvl(3, LevelState.RESTART_LVL);
			} else if (lvl == 4 && playerRank > 1) {
				await dialogMenu("Vous etes la ris\x89e de notre camp, soldat. Reprenez- vous! Un paysan pourrait faire mieux que cela.", true);
				await setLvl(4, LevelState.RESTART_LVL);
			} else if (lvl == 5 && playerRank > 1) {
				await dialogMenu("Mais que faites vous, soldat?! Dois-je vous punir pour votre m\x89diocre perfor- mance?", true);
				await setLvl(5, LevelState.RESTART_LVL);
			} else if (lvl == 6 && playerRank > 1) {
				await dialogMenu("Vas-tu laisser Atra Ceu Tempestate gagner la coupe du monde? Je ne tol\x90rerai pas cela!", true);
				await setLvl(6, LevelState.RESTART_LVL);
			} else if (lvl == 7 && playerRank > 1) {
				await dialogMenu("Perdre? En demi-finale, soldat? N'avez vous donc aucun sens de l'honneur?", true);
				await setLvl(7, LevelState.RESTART_LVL);
			} else if (lvl == 8 && playerRank > 1) {
				await dialogMenu("N'abandonnez pas si pr\x90s du but! Montrez lui que Planeta Casius triomphera quoi qu'il arrive.", true);
				await setLvl(8, LevelState.RESTART_LVL);
			} else {
				lvl++;
				localStorage.setItem("chariotwars", lvl.toString());
				await setLvl(lvl, LevelState.NEW_LVL);
			}
		}
	}
    return 1;
}

async function dispMenu() {
	let i;
	setMap(-1);
	nbBots = 4;
	for (i = 0; i < nbBots; i++) {
		bots[i].posX = START_POS-(4+SPRITE_WIDTH)*(Math.floor(i/3));
		bots[i].posY = (56-((SPRITE_HEIGHT+1)*2))/2 + (i%3)*(SPRITE_HEIGHT+1);
		bots[i].speed = 1;
		bots[i].pushForce = 1;
	}
	player.posX = 80;
	player.posY = -50;
	player.speed = 1;
	player.pushForce = 1;
	do {
		dispMap();
		for (i = 0; i < nbBots; i++) {
			ai(bots[i]);
			if (bots[i].posX > 200) {
				bots[i].posX = 0;
			}
		}
		ML_bmp_or(logo, 2, 2, 25, 13); // Assuming logo array is passed directly
		if (isNewGame || lvl == 0) {
			dispStr("Commencer", 30, 2, 128);
		} else {
			dispStr("Continuer", 33, 2, 128);
		}
		Bdisp_AreaReverseVRAM(29, 1, 69, 9);
		ML_display_vram();
        //await GetKey();
        //await new Promise(resolve => requestAnimationFrame(resolve));
		await Sleep(25);
		ML_clear_vram();
	} while (!isKeyDown(KEY_EXE)); // Removed &
}

async function play() {
	let i;
	let isShiftKeyPressed = NOT_PRESSED;
	do {

		dispMap();

		for (i = 0; i < nbBots; i++) {
			ai(bots[i]);
		}
		ML_display_vram();
        await new Promise(resolve => requestAnimationFrame(resolve));
        await Sleep(50);
		if (isKeyDown(KEY_EXE)) { // Removed &
			if (!isShiftKeyPressed) { // Relies on NOT_PRESSED being 0 / falsey
				isShiftKeyPressed = PRESSED;
			} else {
				isShiftKeyPressed = STILL_PRESSED;
			}

		} else {
			isShiftKeyPressed = NOT_PRESSED;
			locate(15, 8); Print("        ");
		}
		if (isKeyDown(KEY_LEFT) && player.posX-START_POS > 0) { // Removed &
			go(Direction.BACKWARDS, player);
		}
		if (isKeyDown(KEY_RIGHT)) { // Removed &
			go(Direction.FORWARDS, player);
		}
		if (isKeyDown(KEY_UP)) { // Removed &
			if (isShiftKeyPressed == PRESSED) {
				locate(1,8); Print("pushing up");
				push(Direction.LEFT, player);
			}
			go(Direction.LEFT, player);
		}
		if (isKeyDown(KEY_DOWN)) { // Removed &
			if (isShiftKeyPressed == PRESSED) {
				locate(1,8); Print("pushing down");
				push(Direction.RIGHT, player);
			}
			go(Direction.RIGHT, player);
		}

		if (isKeyDown(KEY_F6)) { // Removed &
			player.posX = currentMap[0];
		}
		if (isKeyDown(KEY_CTRL_EXIT)) { // Removed &
			await setLvl(lvl, LevelState.RESTART_LVL);
		}

		ML_clear_vram();
		dispStr("Pouss\x89e:", 78, 57, 128);
		locate(19, 8); PrintXY(108, 57, pressingLevel[isShiftKeyPressed], 0);

		playerRank = 1;
		for (i = 0; i < nbBots; i++) {
			if (player.posX < bots[i].posX) {
				playerRank++;
			}
		}
		dispStr("Place:", 1, 57, 128);
		dispStr(romanNumerals[playerRank-1], 24, 57, 128);
	} while (!gameFinished());
}

function gameFinished() {
	if (player.posX+SPRITE_WIDTH-1 > currentMap[0]) {
		gameState = FINISHED;
	}
	return gameState;
}

async function dialogMenu(str, allowEarlyExit=false) {
	let messageHeight = dispStr(str, 200, 0, 243); // x,y,right_boundary. dispStr calculates height and wraps.
	let dialogTopHeight = 24;
	let scroll = 0;
	clearKeyBuffer();
	ML_clear_vram();
	if (messageHeight > 17) {
		dialogTopHeight = 32-(messageHeight-13)-4;
	}
	if (dialogTopHeight < 1) {
		dialogTopHeight = 1;
	}
	ML_vertical_line(74, dialogTopHeight+8, 32, ML_BLACK); // Assuming 32 is y2 or length
	ML_vertical_line(126, dialogTopHeight+8, 32, ML_BLACK);
	do {
		clearArea(77, dialogTopHeight, 125, dialogTopHeight+47);
		dispStr(str, 79, dialogTopHeight+2-scroll, 122);
		clearArea(77, 0, 125, dialogTopHeight);
		clearArea(77, 47, 125, 63);
		ML_bmp_or(dialogBottom, 69, 32, 58, 16); // Pass array directly
		ML_bmp_or_cl(dialogTop, 74, dialogTopHeight, 53, 8); // Pass array directly
		ML_bmp_or(zezombus, 0, 0, 93, 64); // Pass array directly
        ML_display_vram();
		if (isKeyDown(KEY_CTRL_DOWN) && scroll < messageHeight - 40) { // Heuristic for scroll limit
			scroll += 8;
            await Sleep(100);
		} else if (isKeyDown(KEY_CTRL_UP) && scroll > 0) {
			scroll -= 8;
            await Sleep(100);
		}
        await Sleep(30);
	} while (!isKeyDown(KEY_EXE) || (!allowEarlyExit && scroll < messageHeight - 40));
}

/*
Bot AI:

- Always go forwards
- If there is a zone ahead, try to avoid it
- Always push the player >:D

*/

function ai(bot) {
	let i, j;
    let actionTaken = false; // To replace goto
	//The bot has no way but to check for an obstacle at predefined lengths
	for (i = 1; i <= 40+SPRITE_WIDTH-1; i+=5) {
		if (checkZone(Math.trunc(bot.posX)+i, Math.trunc(bot.posY), bot)) { // checkZone returns non-zero for BZ, SZ, BST
			//Check for passage
			for (j = 1; j <= 55-SPRITE_HEIGHT; j++) { // Iterate all possible Y positions
				if (checkZone(Math.trunc(bot.posX)+i, j, bot) <= 0) { // If found a clear path (<=0 means no BZ/SZ/BST or out of bounds handled by checkZone)
					if (Math.trunc(bot.posY) > j) {
						push(Direction.LEFT, bot); // Push UP (towards smaller Y)
						go(Direction.LEFT, bot);   // Move UP
					} else {
						push(Direction.RIGHT, bot); // Push DOWN (towards larger Y)
						go(Direction.RIGHT, bot);  // Move DOWN
					}
					actionTaken = true; // Equivalent to goto end;
                    break; // from inner loop
				}
			}
		}
        if (actionTaken) {
            break; // from outer loop
        }
	}
	// end: (label from C code)
	go(Direction.FORWARDS, bot);
}

function go(direction, player_) {
	let tempPosX = player_.posX;
	let tempPosY = player_.posY;
	let currentZone;
	switch(direction) {
		case Direction.FORWARDS:
			//If the lvl is >4, then bots behind the player will go faster, while bots in front of the player will go slower
			player_.posX += player_.speed + (
				lvl > 4 ?
					(player_.posX < player.posX - 20) ?
						player_.speed
					: 0
				: 0
			);
			break;
		case Direction.BACKWARDS:
			player_.posX -= player_.speed;
			break;
		case Direction.LEFT: // Corresponds to UP
			player_.posY--;
			break;
		case Direction.RIGHT: // Corresponds to DOWN
			player_.posY++;
			break;
	}
	currentZone = checkZone(Math.trunc(player_.posX), Math.trunc(player_.posY), player_);
	switch(currentZone) {
		case BZ:
			player_.posX = tempPosX;
			player_.posY = tempPosY;
			return;
		case SZ:
			player_.posX -= (player_.posX-tempPosX)*0.5;
			player_.posY -= (player_.posY-tempPosY)*0.5;
			return;
		case BST:
			// Check if boost would push into a BZ.
			// The C code calculates next potential position based on delta, then checks that.
			let deltaX = player_.posX - tempPosX;
			let deltaY = player_.posY - tempPosY;
			if (checkZone(Math.trunc(player_.posX+deltaX), Math.trunc(player_.posY+deltaY), player_) != BZ) {
				player_.posX += deltaX;
				player_.posY += deltaY;
			} else { // If boost leads to BZ, revert to pre-boost state.
				player_.posX = tempPosX;
				player_.posY = tempPosY;
			}
			return;
	}
}

//Only call this function with LEFT or RIGHT
function push(direction, player_) { // direction is Direction.LEFT (0) or Direction.RIGHT (2)
	//Check all the players that the player can push
	let i;
	for (i = 0; i < nbBots; i++) {
		//Check if the player is right next to the bot, and that he wouldn't be pushed into a wall
		if (player_ != bots[i] && Math.abs(Math.trunc(bots[i].posY)-Math.trunc(player_.posY)) <= SPRITE_HEIGHT
				&& Math.abs(Math.trunc(bots[i].posX)-Math.trunc(player_.posX)) <= SPRITE_WIDTH-1
				&& checkZone(Math.trunc(bots[i].posX), Math.trunc(bots[i].posY+player_.pushForce*(direction-1)), bots[i]) != BZ) {
			bots[i].posY += (direction-1)*(player_.pushForce);
		}
	}
	//Same check but for the player
	if (player_ != player && Math.abs(Math.trunc(player.posY)-Math.trunc(player_.posY)) <= SPRITE_HEIGHT
			&& Math.abs(Math.trunc(player.posX)-Math.trunc(player_.posX)) <= SPRITE_WIDTH-1
			&& checkZone(Math.trunc(player.posX), Math.trunc(player.posY+player_.pushForce*(direction-1)), player) != BZ) {
		player.posY += (direction-1)*(player_.pushForce);
	}
}


//Checks if a player whose sprite begins at (x, y) is in a zone, or colliding with another player (returns BZ in this case).
//Returns the zone, or 0 if no zone
function checkZone(x, y, player_) {
	let i;

	//Check out of bounds
	if (y <= 0 || y >= 55-(SPRITE_HEIGHT-1)) {
		return BZ;
	}

	//Check collision with player
	if (player_ != player &&
			x <= Math.trunc(player.posX)+SPRITE_WIDTH-1 && x+SPRITE_WIDTH-1 >= Math.trunc(player.posX) &&
			y <= Math.trunc(player.posY)+SPRITE_HEIGHT-1 && y+SPRITE_HEIGHT-1 >= Math.trunc(player.posY)) {
		return BZ;
	}

	//Check collision with bots
	for (i = 0; i < nbBots; i++) {
		if (player_ != bots[i] &&
				x <= Math.trunc(bots[i].posX)+SPRITE_WIDTH-1 && x+SPRITE_WIDTH-1 >= Math.trunc(bots[i].posX) &&
				y <= Math.trunc(bots[i].posY)+SPRITE_HEIGHT-1 && y+SPRITE_HEIGHT-1 >= Math.trunc(bots[i].posY)) {
			return BZ;
		}
	}

	//Check collision with zone
	// currentMap[1] stores the real size of currentMap array (number of int elements)
	for (i = 2; i < currentMap[1]; i += 5) { // Iterate through zone definitions
		if (
				x <= currentMap[i+2] && x+SPRITE_WIDTH-1 >= currentMap[i] &&
				y <= currentMap[i+3] && y+SPRITE_HEIGHT-1 >= currentMap[i+1]) {
			return currentMap[i+4]; // Return zone type (BZ, SZ, BST)
		}
	}

	return 0; // No zone collision
}

function dispMap() {
	let i, j, k; // k is unused in C

	for (i = currentMap[1]; i >= 2; i -= 5) { // Corrected loop bounds
		switch(currentMap[i+4]) { // zone type is at offset +4
			case BZ:
				ML_rectangle(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+1], currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+3], 1, ML_BLACK, ML_WHITE);
				break;
			case SZ:
				ML_rectangle(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+1], currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+3], 1, ML_BLACK, ML_WHITE);

				//Drawing diagonal lines inside a rectangle is harder than I thought
				for (j = currentMap[i]-(currentMap[i+3]-currentMap[i+1]); j <= currentMap[i+2]; j += 4) {
					if (j < currentMap[i] && j > currentMap[i+2]-(currentMap[i+3]-currentMap[i+1])) {
						ML_line(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i]-j), currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i+2]-j), ML_BLACK);
					} else if (j < currentMap[i]) {
						ML_line(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i]-j), (currentMap[i+3]-currentMap[i+1])+j+START_POS-Math.trunc(player.posX), currentMap[i+3], ML_BLACK);
					} else if (j > currentMap[i+2]-(currentMap[i+3]-currentMap[i+1])) {
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+1], currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i+2]-j), ML_BLACK);
					} else {
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+1], (currentMap[i+3]-currentMap[i+1])+j+START_POS-Math.trunc(player.posX), currentMap[i+3], ML_BLACK);
					}
				}
				break;

			case BST:
				for (j = currentMap[i]-Math.trunc((currentMap[i+3]-currentMap[i+1])/2); j <= currentMap[i+2]; j += 4) {
					if (j < currentMap[i]) {
						ML_line(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i]-j), j+1+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+START_POS-Math.trunc(player.posX), currentMap[i+1]+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+1, ML_BLACK);
						ML_line(currentMap[i]+START_POS-Math.trunc(player.posX), currentMap[i+3]-(currentMap[i]-j), j+1+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+START_POS-Math.trunc(player.posX), currentMap[i+3]-Math.trunc((currentMap[i+3]-currentMap[i+1])/2)-1, ML_BLACK);
					} else if (j > currentMap[i+2]-Math.trunc((currentMap[i+3]-currentMap[i+1])/2)) {
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+1], currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+1]+(currentMap[i+2]-j+1)-1, ML_BLACK);
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+3], currentMap[i+2]+START_POS-Math.trunc(player.posX), currentMap[i+3]-(currentMap[i+2]-j+1)+1, ML_BLACK);
					} else {
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+1], j+1+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+START_POS-Math.trunc(player.posX), currentMap[i+1]+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+1, ML_BLACK);
						ML_line(j+START_POS-Math.trunc(player.posX), currentMap[i+3], j+1+Math.trunc((currentMap[i+3]-currentMap[i+1])/2)+START_POS-Math.trunc(player.posX), currentMap[i+3]-Math.trunc((currentMap[i+3]-currentMap[i+1])/2)-1, ML_BLACK);
					}
				}
		}
	}
	//finish & start lines
	for (i = 0; i < 54; i++) {
		ML_horizontal_line(i+1, currentMap[0]+START_POS+3*Math.trunc(Math.trunc(i/3)%2)-Math.trunc(player.posX), currentMap[0]+START_POS+3*Math.trunc(Math.trunc(i/3)%2)+2-Math.trunc(player.posX), ML_BLACK);
		ML_horizontal_line(i+1, 3+2*START_POS+SPRITE_WIDTH+3*Math.trunc(Math.trunc(i/3)%2)-Math.trunc(player.posX), 2*START_POS+SPRITE_WIDTH+3*Math.trunc(Math.trunc(i/3)%2)+5-Math.trunc(player.posX), ML_BLACK);
	}
	for (i = 0; i < nbBots; i++) {
		dispSprite(defaultSprite, Math.trunc(bots[i].posX+START_POS-player.posX), Math.trunc(bots[i].posY));
	}
	dispSprite(playerSprite, START_POS, Math.trunc(player.posY));
	//road lines
	for (i = 0; i < 17; i++) {
		ML_horizontal_line(0, (i<<3)-Math.trunc(player.posX)%8, (i<<3)+6-Math.trunc(player.posX)%8, ML_BLACK);
		ML_horizontal_line(55, (i<<3)-Math.trunc(player.posX)%8, (i<<3)+6-Math.trunc(player.posX)%8, ML_BLACK);
	}
}

//Displays the given player sprite
function dispSprite(bitmap, x, y) { // bitmap is Uint8Array or number[]
	let i, j;
	let mask;

	for (i = 0; i < SPRITE_SIZE; i++) { // SPRITE_SIZE is bytes in bitmap
		mask = 0x80;
		for (j = 0; j < 8; j++) {
			if (bitmap[i] & mask) {
				ML_pixel(x + ((i << 3) + j) % SPRITE_WIDTH, y + Math.trunc(((i << 3) + j) / SPRITE_WIDTH), ML_BLACK);
			}
			mask >>= 1;
		}
	}
}

async function setLvl(new_lvl, lvlState) { // Renamed parameter 'lvl' to 'new_lvl' to avoid conflict with global 'lvl'
	let i;
	let key;

	//If the player rank is 0 he just launched the game, so different messages are displayed.
	switch(new_lvl) { // Use parameter new_lvl
		case 0:
			if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat !\n\nComme tu le sais, tu as \x89t\x89 choisi pour repr\x89senter le camp de Planeta Casius dans les Courses Pour C\x89sar n\x8A 20. Je suis le centurion Octavius Zezombus et j'ai comme mission de te former \x91 la victoire.\n\nPour avancer, appuie sur les fl\x90ches. Pour pousser les adversaires, il va falloir de la force et appuyer sur [EXE]. Appuie sur [Espace] pour recommencer le niveau. Appuie sur [EXE] pour commencer \x91 t'entrainer.");
			}
			nbBots = 2;
			setMap(0);
			for (i = 1; i <= nbBots; i++) {
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i-1].speed = 0.9;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*3))/2;
			player.speed = 1;
			player.pushForce = 3.5;
			break;
		case 1:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Tr\x90s bien, soldat. Maintenant que tu connais les bases de la course de chariots, tu peux participer \x91 une course de plus haut niveau. Les adversaires ont des meilleurs chevaux que toi, c'est pourquoi je ne te demande que d'arriver deuxi\x90me. Finis deuxi\x90me et je pourrai t'acheter de meilleurs chevaux.");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Continue l'entraine- ment, et sois dans les deux premiers.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 5;
			setMap(1);
			for (i = 1; i <= nbBots; i++) {
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i-1].speed = 1.1;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*3))/2;
			player.speed = 1;
			player.pushForce = 3.5;
			break;
		case 2:
			if ((playerRank == 2 || playerRank == 1) && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Je suis fier de toi, soldat ! Je t'ai achet\x89 des chevaux de comp\x89tition. Fais en bon usage. Va, soldat, et restore la fiert\x89 de Planeta Casius.");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la comp\x89tition, et sois le premier.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 5;
			setMap(1);
			for (i = 1; i <= nbBots; i++) {
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i-1].speed = 1.1;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*3))/2;
			player.speed = 1.15;
			player.pushForce = 3.5;
			break;
		case 3:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Soldat ! Tu as rempli ta mission et honor\x89 Planeta Casius. Tu es maintenant qualifi\x89 pour la Coupe du monde de Courses Pour C\x89sar! Montre donc au monde ce dont notre l\x89gion est capable!");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la coupe, et fais honneur \x91 ton camp.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 2;
			setMap(2);
			for (i = 1; i <= nbBots; i++) {
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i-1].speed = 1.3;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*3))/2;
			player.speed = 1.15;
			player.pushForce = 3.5;
			break;

		case 4:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Le chef du camp Tignus Ignoramus, Critorix, veut te d\x89fier en duel. Cela ne sera pas facile, il a des chevaux bien plus rapides. La seule mani\x90re pour toi de gagner est de le pousser dans le sable.");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Fais honneur \x91 ton camp et vainc ce gaulois! Pousse le sur le cot\x89!");
			}
			nbBots = 1;
			setMap(3);
			for (i = 1; i <= nbBots; i++) { // Loop runs once for i=1. bots[0] is set.
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3)); // i=1, i/3 = 0.
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*2))/2 + (i%3)*(SPRITE_HEIGHT+1); // i=1, i%3 = 1.
				bots[i-1].speed = 2.15;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*2))/2; // Player Y matches bot Y if (i%3) was 0.
			player.speed = 1.15;
			player.pushForce = 3.5;
			break;

		case 5:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Maintenant que le monde reconnait notre camp, les courses seront plus dures. Continue ton travail, l'affront n'est pas fini.");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la coupe, et fais honneur \x91 ton camp.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 2;
			setMap(4);
			for (i = 1; i <= nbBots; i++) {
				bots[i-1].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i-1].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i-1].speed = 1.40;
				bots[i-1].pushForce = 1;
			}
			player.posX = START_POS;
			player.posY = (56-((SPRITE_HEIGHT+1)*3))/2;
			player.speed = 1.20;
			player.pushForce = 3.5;
			break;

		case 6:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("C'est de la corruption, soldat ! En quart de finale, notre ennemi, Atra Ceu Tempestate, t'a fait commencer dans du sable, et en dernier. Je t'ai attel\x89 de nouveaux chevaux, montre leur que rien ne nous arretera!");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la coupe, et fais honneur \x91 ton camp.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 3;
			setMap(5);
			for (i = 0; i < nbBots; i++) {
				bots[i].posX = START_POS-(4+SPRITE_WIDTH)*(Math.trunc(i/3));
				bots[i].posY = (56-((SPRITE_HEIGHT+1)*3))/2 + (i%3)*(SPRITE_HEIGHT+1);
				bots[i].speed = 1.4;
				bots[i].pushForce = 1;
			}
			player.posX = START_POS-4-SPRITE_WIDTH;
			player.posY = (56-((SPRITE_HEIGHT+1)))/2; // Centered Y if only one row of players
			player.speed = 1.6;
			player.pushForce = 3.5;
			break;

		case 7:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Pour la demi-finale, je t'ai donn\x89 les meilleurs chevaux de Planeta Casius. N'\x89choue pas!");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la coupe, et fais honneur \x91 ton camp.\n\nJe te rappelle que, pour pousser les adversaires, il faut appuyer \x91 r\x89p\x89tition sur [EXE].");
			}
			nbBots = 3;
			setMap(6);
			for (i = 0; i < nbBots; i++) {
				bots[i].posX = START_POS-4-SPRITE_WIDTH; // All bots start at same X
				bots[i].speed = 2.1;
				bots[i].pushForce = 1;
			}
			bots[0].posY = 3;
			bots[1].posY = 16;
			bots[2].posY = 42;
			player.posX = START_POS-4-SPRITE_WIDTH;
			player.posY = 29;
			player.speed = 2;
			player.pushForce = 3.5;
			break;
		case 8:
			if (playerRank == 1 && lvlState == LevelState.NEW_LVL) {
				await dialogMenu("Soldat, c'est la finale! Ton adversaire est l'infame Atra Ceu Tempestate, il fera tout son possible pour gagner. La moindre erreur peut te couter la victoire!");
			} else if (playerRank == 0) {
				await dialogMenu("Av\x89 soldat ! Remporte la finale et nous c\x89l\x90brerons tout cela rentr\x89s au camp.");
			}
			nbBots = 1;
			setMap(7);
			for (i = 0; i < nbBots; i++) { // Loop runs once for i=0. bots[0] is set.
				bots[i].posX = START_POS-4-SPRITE_WIDTH;
				bots[i].speed = 2.2;
				bots[i].pushForce = 1;
			}
			bots[0].posY = 9;
			player.posX = START_POS-4-SPRITE_WIDTH;
			player.posY = 35;
			player.speed = 2.2;
			player.pushForce = 3.5;
			break;

		case 9:
			//Level 9 doesn't really exist, it's entered when the player has beaten the boss.
			await dialogMenu("Tu aurais pu faire bien mieux que cela, soldat. Heureuse- ment que tu as gagn\x89, mais n'oublie pas que c'est grace \x91 moi.");
			PopUpWin(5);
			locate(3,2); Print("Voulez-vous taper");
			locate(7,3); Print("Zezombus?");
			locate(5,5); Print("[EXE]: Oui");
			locate(4,6); Print("[EXIT]: Non");
			clearKeyBuffer();
			do {
				key = await GetKey();
			} while (key != KEY_CTRL_EXIT && key != KEY_CTRL_EXE);

			if (key == KEY_CTRL_EXE) {
				//Punching time :D
				localStorage.setItem("chariotwars", "0"); // Reset level
				let fistDirection;
                let lastFistDirection = 0;
				ML_clear_vram();
				while (1) {
					if (isAnyKeyDown()) { // isAnyKeyDown is a mock helper for this
						fistDirection = rand()%4;
                        if (fistDirection == lastFistDirection) {
                            fistDirection = (fistDirection + 1) % 4; // Change direction if same as last
                        }
                        lastFistDirection = fistDirection;
						if (fistDirection == 0) {
							ML_bmp_or_cl(fistTop, 41, -10, 43, 70);
						} else if (fistDirection == 1) {
                            //console.log("Fist direction: RIGHT");
							ML_bmp_or_cl(fistRight, 57, 20, 70, 43);
						} else if (fistDirection == 2) {
							ML_bmp_or_cl(fistBottom, 41, 31, 43, 70);
						} else if (fistDirection == 3) {
							ML_bmp_or_cl(fistLeft, 0, 20, 70, 43);
						}
						ML_display_vram();
						await Sleep(300);
						ML_clear_vram();
					}
					ML_bmp_or(zezombus, 17, 0, 93, 64);
					ML_display_vram();
                    await Sleep(50);
				}
			}
			return; // Return from setLvl after case 9 handled
	}

	await dispCountdown();
}

async function dispCountdown() {
	let i;
	for (i = 3; i > 0; i--) {
		ML_clear_vram();
		dispMap();
		ML_horizontal_line(24, 59, 59+9, ML_BLACK);
		ML_horizontal_line(25, 59, 59+9, ML_BLACK);
		ML_horizontal_line(29, 59, 59+9, ML_BLACK);
		ML_horizontal_line(30, 59, 59+9, ML_BLACK);
		if (i == 1) {
			ML_vertical_line(63, 26, 28, ML_BLACK); // Assuming y1, y2
			ML_vertical_line(64, 26, 28, ML_BLACK);
		} else if (i == 2) {
			ML_vertical_line(61, 26, 28, ML_BLACK);
			ML_vertical_line(62, 26, 28, ML_BLACK);
			ML_vertical_line(65, 26, 28, ML_BLACK);
			ML_vertical_line(66, 26, 28, ML_BLACK);
		} else { // i == 3
			ML_vertical_line(63, 26, 28, ML_BLACK);
			ML_vertical_line(64, 26, 28, ML_BLACK);
			ML_vertical_line(61, 26, 28, ML_BLACK);
			ML_vertical_line(66, 26, 28, ML_BLACK);
		}
		ML_display_vram();
		await Sleep(333);
	}
}

function setMap(map) { // map parameter is an index for maps array
	let i; // unused in JS version

	//Important: when setting positive zones (boosters, etc) make sure to fill the rest of the height with BSZ's.
	//In case of player overlapping 2 zones, only the first zone is taken into account. So put the boosters before the BSZ's.
	//More generally, the order is: BZ, SZ, BST, BSZ

	/*Map template - copy/paste
	static int map1[] = {400, 0, // In JS: let map1 = [400, 0,
		//x1, y1, x2, y2, zone,

	]; // In JS: ];
	*/

	//menu map
	// In C, these are static. In JS, they are defined here and effectively static to this function's scope if not exported.
	// Or make them global consts if they don't change. The `map_X[1] = length` part means they are modified. So `let`.
	let map_1 = [400, 0,
		//x1, y1, x2, y2, zone,
		60, 0, 88, 15, BZ,
		//55, 30, 70, 40, BST,
		//55, 41, 70, 54, BSZ,
		88, 0, 130, 10, BZ,
		85, 20, 100, 30, SZ,
		//120, 45, 140, 54, SZ,
		175, 20, 200, 40, BZ,
	];

	let map0 = [400, 0,
		120, 20, 140, 35, BZ,
		200, 1, 230, 30, SZ,
		200, 48, 230, 54, BSZ,
		300, 1, 390, 7, SZ,
		300, 48, 390, 54, SZ,
	];

	let map1 = [700, 7,
		120, 40, 170, 50, BZ,
		50, 40, 120, 50, BSZ, // BSZ is likely 0 or a distinct const
		220, 20, 240, 35, SZ,
		300, 1, 350, 9, BZ,
		//300, 45, 350, 54, BZ,
		310, 15, 330, 40, SZ,
		//390, 44, 399, 54, SZ,
		375, 1, 410, 20, SZ,
		385, 40, 400, 49, SZ,
		450, 20, 470, 35, BZ,
		500, 1, 570, 10, SZ,
		500, 45, 630, 54, SZ,
		550, 30, 560, 45, SZ,
		620, 10, 630, 25, SZ,
	];

	let map2 = [500, 0,
		//x1, y1, x2, y2, zone,
		70, 1, 90, 5, SZ,
		70, 20, 90, 35, SZ,
		70, 50, 90, 54, SZ,
		//70, 20, 90, 54, SZ,
		150, 22, 160, 37, BZ,
		250, 47, 280, 54, SZ,
		250, 1, 280, 8, SZ,
		310, 30, 325, 40, BZ,
		480, 1, 499, 5, SZ,
		480, 25, 499, 30, BZ,
		480, 50, 499, 54, SZ,

		//190, 25, 210, 33, BST,
		//190, 1, 210, 23, BST,
		//190, 36, 210, 54, BST,
		//260, 36, 280, 54, BST,
	];

	let map3 = [450, 0,
		//x1, y1, x2, y2, zone,
		20, 1, 580, 8, SZ, // X2 of 580 on a 450 length map? Map length is finish line. Zones can be beyond.
		20, 47, 580, 54, SZ,
	];

	let map4 = [600, 0,
		//x1, y1, x2, y2, zone,
		100, 20, 120, 37, BZ,
		170, 46, 200, 54, SZ,
		230, 1, 250, 13, BZ,
		350, 32, 370, 54, BZ,
		350, 28, 370, 32, SZ, // This SZ is "between" the BZ parts if Y is contiguous
		450, 1, 465, 7, BZ,
		460, 45, 650, 54, SZ,
		520, 1, 650, 6, SZ,
	];

	let map5 = [411, 0,
		//x1, y1, x2, y2, zone,
		-14, 1, 16, 54, SZ, // Starting in SZ
		80, 1, 120, 10, BST,
		80, 11, 120, 54, BSZ, // Assuming BSZ=0 (no effect zone)
		165, 13, 210, 15, BZ,
		150, 1, 165, 35, SZ,
		195, 1, 210, 10, BST,
		165, 15, 175, 54, BSZ,
		175, 15, 230, 35, BSZ,
		205, 50, 230, 54, SZ,
		300, 20, 320, 40, BZ,
		360, 1, 410, 15, SZ,
	];

	let map6 = [600, 0,
		//x1, y1, x2, y2, zone,
		70, 1, 90, 11, BZ,
		70, 44, 90, 54, SZ,
		160, 32, 175, 54, BZ,
		90, 1, 160, 16, BSZ,
		220, 16, 240, 35, BZ,
		280, 1, 340, 10, SZ,
		370, 15, 385, 35, BZ,
		370, 50, 385, 54, SZ,
		520, 1, 540, 6, BZ,
		520, 7, 540, 15, BST,
		490, 1, 520, 6, BSZ,
		520, 16, 540, 54, BSZ,
	];

	let map7 = [1000, 0,
		//x1, y1, x2, y2, zone,
		100, 45, 200, 54, SZ,
		50, 1, 170, 30, BSZ,
		240, 25, 260, 37, SZ,
		310, 40, 315, 54, BZ,
		310, 13, 315, 25, BZ,
		240, 13, 300, 54, BSZ, // This covers part of the BZs above if order matters (painter's algo for checkZone)
		                         // checkZone iterates first-found, so BZs should be listed first if they are "on top" of BSZs.
		                         // C code for checkZone implies order in array matters.
		375, 20, 380, 42, BZ,
		445, 42, 450, 54, BZ,
		495, 20, 498, 31, BZ,
		495, 44, 498, 54, BZ,
		320, 1, 499, 54, BST,  // Large BST area
		320, 1, 500, 42, BSZ,  // This BSZ overlaps/is overlapped by BST. Order is important.
		                         // The comment "BZ, SZ, BST, BSZ" implies specific handling or drawing order.
		                         // For checkZone, if BST is listed after BSZ, BST will take precedence if coordinates overlap.
		                         // If BSZ means "no effect", it's better to list effectful zones first.
		534, 20, 545, 35, SZ,
		590, 25, 600, 29, SZ,
		590, 42, 600, 54, SZ,
		660, 30, 674, 40, SZ,
		660, 52, 680, 54, BST,
		675, 30, 710, 45, BST,
		755, 30, 760, 35, BZ,
		701, 20, 770, 25, BST,
		820, 15, 835, 30, SZ,
		820, 43, 835, 54, SZ,
		820, 31, 835, 42, BST,
		660, 1, 785, 10, BST,
		820, 1, 835, 14, BST,
		950, 25, 960, 35, BST,
		850, 1, 949, 35, BSZ,
		950, 1, 1000, 24, BSZ,
		950, 36, 1000, 54, BSZ,
	];

	// In JS, array of arrays. C `static int* maps[]` is array of pointers.
	let maps = [map_1, map0, map1, map2, map3, map4, map5, map6, map7];

	//Can't do sizeof on a pointer, sadly.
	/*for (i = 0; i < sizeof(maps)/sizeof(maps[0]); i++) { // JS: maps.length
		maps[i][1] = sizeof(maps[i])/sizeof(maps[i][0]); // JS: maps[i].length
	}*/
	// The C code modifies the actual map arrays.
	map_1[1] = map_1.length;
	map0[1] = map0.length;
	map1[1] = map1.length;
	map2[1] = map2.length;
	map3[1] = map3.length;
	map4[1] = map4.length;
	map5[1] = map5.length;
	map6[1] = map6.length;
	map7[1] = map7.length;

	currentMap = maps[map+1]; // map index is -1 for menu, 0 for map0, etc.
}

return {AddIn_main};

}
