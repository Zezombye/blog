
export default function testandropov({

    SaveDisp,
    RestoreDisp,
    KEY_CTRL_UP,
    KEY_CTRL_DOWN,
    KEY_CTRL_LEFT,
    KEY_CTRL_RIGHT,
    KEY_CTRL_EXIT,
    KEY_CTRL_EXE,
    KEY_CTRL_SHIFT,
    rand,
    dispStr,
    PopUpWin,
    ML_rectangle,
    ML_line,
    ML_point,
    ML_circle,
    ML_filled_circle,
    ML_bmp_or,
    ML_bmp_or_cl,
    ML_bmp_8_or,
    ML_bmp_and,
    ML_display_vram,
    ML_clear_vram,
    ML_horizontal_line,
    ML_vertical_line,
    ML_pixel_test,
    ML_BLACK,
    ML_WHITE,
    ML_XOR,
    ML_TRANSPARENT,
    GetKey,
    Bdisp_AllClr_DDVRAM,
    Bdisp_ReadArea_VRAM,
    IsKeyDown,
    Bdisp_SetPoint_VRAM,
    Bdisp_DrawLineVRAM,
    Bfile_OpenFile,
    Bfile_ReadFile,
    Bfile_SeekFile,
    Bfile_WriteFile,
    Bfile_CreateFile,
    Bfile_CloseFile,
    Bfile_DeleteFile,
    Bdisp_WriteGraph_VRAM,
    Bdisp_PutDisp_DD,
    Sleep,
    PrintXY,
    locate,
    Print,
    _OPENMODE_READ,
    _OPENMODE_WRITE,
    IMB_WRITEMODIFY_NORMAL,
    IMB_WRITEMODIFY_REVERCE,
    IMB_WRITEMODIFY_MESH,
    IMB_AREAKIND_OVER,
    IMB_AREAKIND_MESH,
    IMB_AREAKIND_CLR,
    IMB_AREAKIND_REVERSE,
    MINI_REV,
}) {

    function PrintMini(x: number, y: number, str: string, color: number): void {
        dispStr(str, x, y - 1, 99999999);
    }

    // Assuming ML_*, PrintMini, IsKeyDown, GetKey, Sleep, SaveDisp, RestoreDisp, locate, Print
    // KEY_*, MINI_REV, ML_BLACK, ML_WHITE
    // are defined elsewhere.

    let g_level: number = 0;
    let g_i: number; // In C, some are global, some local. Clarified usage based on context.
    // This 'i' is used as loop var, and also controls jump state in jeu().
    let g_op: number;
    let g_a: number; // Loop variable, and also pixel test offset
    let g_d: number; // Current "floor" or vertical section of level
    let g_b: number; // Pixel test offset
    let g_boom: number = 26;
    let g_bout: number; // Flag for end of level or path
    let g_stop: number = 1; // Game stop flag
    let g_e: number; // Jump vertical speed / gravity effect, and also loop var in niveaux()
    let g_x: number = 5; // Player x
    let g_y: number = 22; // Player y
    let g_sens: number = 1; // Player direction
    let g_bloc: number[][] = Array(12).fill(null).map(() => Array(25).fill(0));
    let g_boom2: number = 48;
    let g_boom3: number = 125;
    let g_jump: number = .075;
    let g_speed: number = 10;
    let g_death: number = 0;
    const g_score_chars: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']; // C: char score[10]
    let g_yo: number;
    let g_go: number;
    let g_omg: number;
    const g_bam: number[] = [66, 26, 24, 194, 194, 24, 152];
    const g_bam2: number[] = [104, 106, 0, 152, 24, 198, 214];
    const g_bam3: number[] = [150, 102, 104, 144, 150, 102, 96];
    let g_poc: number; // Loop variable for explosion animation

    async function niveaux(): Promise<void>//initialisation des niveaux
    {
        ML_clear_vram();  //efface tout
        SaveDisp(1);


        ML_horizontal_line(6, 1, 127, ML_BLACK); //affichage de base
        ML_horizontal_line(25, 1, 127, ML_BLACK);
        ML_horizontal_line(44, 1, 127, ML_BLACK);
        ML_horizontal_line(63, 1, 127, ML_BLACK);
        PrintMini(115, 0, "BTL", 1);
        if (g_level == 0) { PrintMini(50, 0, "1/15", 1); } // In C, level starts at 0, but AddIn_main increments it before calling. First call: level=1
        g_go = 1;
        g_omg = g_death;
        ML_rectangle(1, 0, 47, 5, 1, ML_WHITE, ML_WHITE);
        for (g_op = 1000; g_op > .1; g_op = g_op / 10) {
            g_yo = Math.floor(g_omg / g_op); // C: int cast truncates
            g_omg = ((g_omg / g_op) - (Math.floor(g_omg / g_op))) * g_op; // C: int cast
            if (g_yo >= 1 || g_go > 2) {
                PrintMini(g_go, 0, g_score_chars[g_yo], 1); // C: &score[yo] is char* to the char
                ML_rectangle(g_go + 3, 0, 47, 5, 1, ML_WHITE, ML_WHITE);
                SaveDisp(1);
                g_go = g_go + 4;
            }
        }


        for (g_i = 0; g_i < 12; g_i++) // initialise le tableau
        {
            for (g_a = 0; g_a < 25; g_a++) {
                g_bloc[g_i][g_a] = 0;
            }
        }
        ML_rectangle(45, 0, 52, 5, 1, ML_WHITE, ML_WHITE); // Clears part of screen where level number goes
        if (g_level == 1) {
            g_bloc[11][10] = 5;
            PrintMini(50, 0, "1/15", 1);
        }
        if (g_level == 2) {
            g_bloc[3][6] = 4;
            g_bloc[3][17] = 5;
            g_bloc[7][11] = 4;
            g_bloc[7][12] = 4;
            g_bloc[11][8] = 5;
            g_bloc[11][18] = 5;
            PrintMini(50, 0, "2/15", 1);
        }
        if (g_level == 3) {
            g_bloc[3][9] = 5;
            g_bloc[3][15] = 5;
            g_bloc[7][16] = 4;
            g_bloc[7][10] = 5;
            g_bloc[7][4] = 6;
            g_bloc[11][16] = 6;
            g_bloc[8][16] = 9;
            PrintMini(50, 0, "3/15", 1);
        }
        if (g_level == 4) {
            g_bloc[3][8] = 5;
            g_bloc[3][18] = 6;
            g_bloc[6][7] = 5;
            g_bloc[6][8] = 5;
            g_bloc[6][6] = 5;
            g_bloc[7][12] = 2;
            g_bloc[6][17] = 9;
            g_bloc[6][16] = 9;
            g_bloc[11][7] = 3;
            g_bloc[11][12] = 3;
            g_bloc[11][17] = 3;
            PrintMini(50, 0, "4/15", 1);
        }
        if (g_level == 5) {
            g_bloc[3][7] = 4;
            g_bloc[3][13] = 1;
            g_bloc[3][19] = 4;
            g_bloc[7][2] = 2;
            g_bloc[7][3] = 2;
            g_bloc[7][10] = 2;
            g_bloc[6][13] = 3;
            g_bloc[7][16] = 2;
            g_bloc[11][6] = 3;
            g_bloc[11][11] = 2;
            g_bloc[10][15] = 4;
            g_bloc[11][19] = 4;
            PrintMini(50, 0, "5/15", 1);
        }

        if (g_level == 6) {
            g_bloc[3][6] = 2;
            g_bloc[3][7] = 3;
            g_bloc[3][8] = 4;
            g_bloc[3][20] = 2;
            g_bloc[3][19] = 3;
            g_bloc[3][18] = 4;
            g_bloc[7][7] = 5;
            g_bloc[6][11] = 5;
            g_bloc[6][10] = 5;
            g_bloc[11][9] = 5;
            g_bloc[11][11] = 3;
            g_bloc[11][21] = 4;
            g_bloc[11][20] = 3;
            locate(5, 5);
            Print("SPEED UPGRADE!" as any);
            ML_display_vram();
            await Sleep(300);
            locate(5, 5);
            Print("                                " as any);
            g_speed = 8;
            PrintMini(50, 0, "6/15", 1);
        }

        if (g_level == 7) {
            g_bloc[3][21] = 8;
            g_bloc[7][5] = 8;
            g_bloc[7][6] = 8;
            g_bloc[7][4] = 8;
            g_bloc[7][3] = 8;
            g_bloc[11][8] = 5;
            g_bloc[10][11] = 7;
            g_bloc[11][19] = 19; // This is > 5, will draw many lines.
            ML_point(80, 15, 2, ML_BLACK);
            ML_point(100, 40, 2, ML_BLACK);
            ML_point(90, 40, 2, ML_BLACK);
            ML_point(72, 36, 2, ML_BLACK);
            ML_point(62, 36, 2, ML_BLACK);
            ML_point(61, 60, 2, ML_BLACK);
            PrintMini(50, 0, "7/15", 1);
        }
        if (g_level == 8) {
            g_bloc[3][5] = 1;
            g_bloc[3][6] = 1;
            g_bloc[3][7] = 1;
            g_bloc[3][20] = 3;
            g_bloc[3][21] = 3;
            g_bloc[3][19] = 3;
            g_bloc[7][16] = 3;
            g_bloc[7][14] = 5;
            g_bloc[4][5] = 4;
            g_bloc[4][6] = 4;
            g_bloc[4][7] = 4;
            PrintMini(50, 0, "8/15", 1);
        }
        if (g_level == 9) {
            g_bloc[3][6] = 4;
            g_bloc[3][10] = 4;
            g_bloc[3][16] = 4;
            g_bloc[3][21] = 4;
            g_bloc[7][17] = 6;
            g_bloc[7][13] = 4;
            g_bloc[7][7] = 2;
            g_bloc[7][2] = 2;
            g_bloc[11][7] = 3;
            g_bloc[11][8] = 3;
            g_bloc[11][9] = 3;
            g_bloc[10][18] = 5;
            g_bloc[11][21] = 4;
            PrintMini(50, 0, "9/15", 1);
        }
        if (g_level == 10) {
            g_bloc[3][7] = 4;
            g_bloc[3][8] = 4;
            g_bloc[3][9] = 4;
            g_bloc[3][15] = 5;
            g_bloc[7][15] = 4;
            g_bloc[6][12] = 5;
            g_bloc[7][6] = 4;
            g_bloc[6][3] = 5;
            g_bloc[11][7] = 4;
            g_bloc[10][10] = 4;
            g_bloc[11][14] = 4;
            g_bloc[10][18] = 4;
            g_bloc[11][22] = 4;
            PrintMini(50, 0, "10/15", 1);
        }

        if (g_level == 11) {
            g_bloc[3][7] = 8;
            g_bloc[3][19] = 10;
            g_bloc[7][14] = 10;
            g_bloc[7][13] = 8;
            g_bloc[7][12] = 6;
            g_bloc[7][6] = 9;
            g_bloc[7][5] = 7;
            g_bloc[7][4] = 5;
            g_bloc[11][6] = 10;
            g_bloc[11][12] = 10;
            g_bloc[11][18] = 10;
            g_jump = .1;
            locate(5, 5);
            Print("JUMP UPGRADE!" as any);
            ML_display_vram();
            await Sleep(300);
            locate(5, 5);
            Print("                                " as any);
            PrintMini(50, 0, "11/15", 1);
        }

        if (g_level == 12) {
            g_bloc[3][10] = 6;
            g_bloc[1][13] = 10;
            g_bloc[3][17] = 8;
            g_bloc[7][6] = 10;
            g_bloc[6][10] = 5;
            g_bloc[6][11] = 5;
            g_bloc[7][15] = 10;
            g_bloc[11][8] = 6;
            g_bloc[11][13] = 10;
            g_bloc[11][19] = 8;
            PrintMini(50, 0, "12/15", 1);
        }

        if (g_level == 13) {
            g_bloc[3][6] = 10;
            g_bloc[3][17] = 6;
            g_bloc[2][21] = 5;
            g_bloc[2][20] = 5;
            g_bloc[7][17] = 10; // This overwrites the next line's g_bloc[7][17] in C
            g_bloc[7][17] = 6;
            g_bloc[6][14] = 5;
            g_bloc[6][13] = 5;
            g_bloc[6][12] = 5;
            g_bloc[7][8] = 11;
            g_bloc[11][11] = 3;
            g_bloc[10][14] = 5;
            g_bloc[10][15] = 5;
            g_bloc[10][16] = 5;
            g_bloc[11][20] = 11;
            PrintMini(50, 0, "13/15", 1);
        }

        if (g_level == 14) {
            g_bloc[3][10] = 4;
            g_bloc[2][13] = 5;
            g_bloc[2][14] = 5;
            g_bloc[3][17] = 7;
            g_bloc[2][18] = 2;
            g_bloc[7][15] = 6;
            g_bloc[6][12] = 5;
            g_bloc[6][11] = 5;
            g_bloc[7][8] = 7;
            g_bloc[7][2] = 4;
            g_bloc[11][9] = 4;
            g_bloc[10][12] = 4;
            g_bloc[11][16] = 2;
            g_bloc[10][20] = 5;
            g_bloc[10][21] = 5;
            PrintMini(50, 0, "14/15", 1);
        }
        if (g_level == 15) {
            g_bloc[3][5] = 4;
            g_bloc[3][6] = 4;
            g_bloc[3][7] = 4;
            g_bloc[3][18] = 4;
            g_bloc[2][21] = 5;
            g_bloc[2][22] = 5;
            g_bloc[2][23] = 5;
            g_bloc[2][24] = 5;
            g_bloc[7][15] = 10;
            g_bloc[7][9] = 8;
            g_bloc[7][3] = 11;
            g_bloc[11][8] = 6;
            g_bloc[10][11] = 5;
            g_bloc[11][14] = 7;
            g_bloc[10][15] = 2;
            g_bloc[11][20] = 1;
            PrintMini(50, 0, "15/15", 1);
        }
        // Renamed loop var 'i' and 'a' to avoid conflict with globals
        for (let li = 0; li < 12; li++) // C uses global i, a, e
        {
            for (let la = 0; la < 25; la++) {
                for (g_e = 0; g_e < g_bloc[li][la]; g_e++) // C uses global e
                {
                    ML_horizontal_line(5 * (li + 1) - g_e + 4 - (Math.floor(li / 4)), 5 * (la + 1), 5 * (la + 1) + 5, ML_BLACK); // C: (i/4) is integer division
                }
            }
        }
        if (g_level == 8) {
            ML_rectangle(25, 48, 27, 50, 1, ML_BLACK, ML_BLACK);
            ML_rectangle(29, 48, 31, 50, 1, ML_BLACK, ML_BLACK);
            ML_rectangle(33, 48, 35, 50, 1, ML_BLACK, ML_BLACK);
            ML_rectangle(37, 48, 39, 50, 1, ML_BLACK, ML_BLACK);
            ML_horizontal_line(25, 31, 45, ML_WHITE);
            ML_vertical_line(34, 26, 30, ML_WHITE);
            ML_vertical_line(30, 26, 30, ML_WHITE);
            ML_vertical_line(38, 26, 30, ML_WHITE);
            ML_horizontal_line(24, 30, 30, ML_WHITE);
            ML_vertical_line(42, 26, 30, ML_WHITE);
        }
        PrintMini(124, 21, "x", 1);
        PrintMini(1, 40, "x", 1);
        PrintMini(124, 59, "x", 1);
        ML_rectangle(45, 0, 90, 5, 1, ML_WHITE, ML_WHITE); // Clears top-middle area for level text
        switch (g_level)                                             //ceci est honteux mais quand on l'enlève j'obtient un bug inexpliqué et trsè ch*ant
        {
            case 1: PrintMini(50, 0, "1/15", 1); break;
            case 2: PrintMini(50, 0, "2/15", 1); break;
            case 3: PrintMini(50, 0, "3/15", 1); break;
            case 4: PrintMini(50, 0, "4/15", 1); break;
            case 5: PrintMini(50, 0, "5/15", 1); break;
            case 6: PrintMini(50, 0, "6/15", 1); break;
            case 7: PrintMini(50, 0, "7/15", 1); break;
            case 8: PrintMini(50, 0, "8/15", 1); break;
            case 9: PrintMini(50, 0, "9/15", 1); break;
            case 10: PrintMini(50, 0, "10/15", 1); break;
            case 11: PrintMini(50, 0, "11/15", 1); break;
            case 12: PrintMini(50, 0, "12/15", 1); break;
            case 13: PrintMini(50, 0, "13/15", 1); break;
            case 14: PrintMini(50, 0, "14/15", 1); break;
            case 15: PrintMini(50, 0, "15/15", 1); break;
        }
        SaveDisp(1); // enregistre l'image
        g_i = 0; g_e = 0; g_d = 1; g_a = 0; // Reset some globals. g_d=1 is critical.
    }
    async function jeu(): Promise<void> {
        ML_point(g_x, g_y, 4, ML_WHITE);  //carre se déplaçant
        ML_rectangle(1, 45, 127, 53, 1, ML_WHITE, ML_WHITE);
        ML_rectangle(1, 7, 127, 15, 1, ML_WHITE, ML_WHITE);
        ML_rectangle(1, 26, 127, 34, 1, ML_WHITE, ML_WHITE);
        g_x = g_x + g_sens;
        if (g_i == 0) // g_i is jump state flag
        { if (IsKeyDown(KEY_CTRL_EXE)) { g_i = 1; g_e = -1; if (g_level > 10) { g_e = -1.5; } } }//sauter avec n'importe quelle touche
        if (g_i) // If jumping
        {
            g_y = g_y + g_e;
            g_e = g_e + g_jump;
            if (g_y >= 19 * g_d + 3) { g_i = 0; g_y = 19 * g_d + 3; } // Land on current floor g_d
        }
        if (g_level == 8) {
            if (g_y < 45 && g_y > 25 && g_x < 50 && g_boom < 41) // Middle section, left side
            {
                ML_horizontal_line(g_boom, 35, 37, ML_WHITE); // Clear old pos
                g_boom++;
            } // Move boom down
            ML_rectangle(35, g_boom, 37, g_boom + 2, 1, ML_BLACK, ML_BLACK); // Draw new pos

            if (g_y > 45 && g_boom2 < 60) // Bottom section
            {
                ML_horizontal_line(g_boom2, 25, 27, ML_WHITE);
                g_boom2++;
            }
            ML_rectangle(25, g_boom2, 27, g_boom2 + 2, 1, ML_BLACK, ML_BLACK);
            if (g_y > 45 && g_x > 50) // Bottom section, right side
            { ML_vertical_line(g_boom3, 58, 62, ML_WHITE); g_boom3--; }
            ML_rectangle(g_boom3, 58, g_boom3 - 4, 63, 1, ML_BLACK, ML_BLACK);
            SaveDisp(1);
        }
        if (g_x > 121 || g_x < 6)   //bout d'un niveau
        {
            g_d++; g_sens = -g_sens; g_y = 19 * g_d + 3; // Go to next floor (g_d), reverse direction
            if (g_y > 70) { g_bout = 0; } // If past last floor (approx 19*3+3 = 60), end level
        }
        // Renamed loop vars a, b to la, lb to avoid global conflict
        for (let la = -2; la < 3; la++)  //pixel test
        {
            for (let lb = -2; lb < 3; lb = lb + 4) // Tests only lb = -2 and lb = 2
            {
                if (ML_pixel_test(g_x + lb, g_y + la) == ML_BLACK) {
                    if (g_level == 7) // Special collision handling for level 7 pixels
                    {
                        if (g_x >= 78 && g_x < 83 && g_y > 10 && g_y < 19) // Specific area
                        {
                            ML_rectangle(110, 15, 115, 24, 0, ML_WHITE, ML_WHITE); // Clear some other area
                            ML_rectangle(78, 13, 82, 18, 0, ML_WHITE, ML_WHITE); // Clear this pixel block
                        }
                        if (g_x < 104 && g_x > 97 && g_y > 36 && g_y < 45) {
                            ML_rectangle(40, 30, 35, 43, 0, ML_WHITE, ML_WHITE);
                            ML_rectangle(98, 38, 102, 42, 0, ML_WHITE, ML_WHITE);
                        }
                        if (g_x < 94 && g_x > 87 && g_y > 36 && g_y < 45) {
                            ML_rectangle(35, 30, 30, 43, 0, ML_WHITE, ML_WHITE);
                            ML_rectangle(88, 38, 92, 42, 0, ML_WHITE, ML_WHITE);
                        }
                        if (g_x < 76 && g_x > 69 && g_y > 31 && g_y < 41)
                        {
                            ML_rectangle(30, 30, 25, 43, 0, ML_WHITE, ML_WHITE);
                            ML_rectangle(70, 34, 74, 38, 0, ML_WHITE, ML_WHITE);
                        }
                        if (g_x < 66 && g_x > 59 && g_y > 31 && g_y < 41) {
                            ML_rectangle(20, 30, 25, 43, 0, ML_WHITE, ML_WHITE);
                            ML_rectangle(60, 34, 64, 38, 0, ML_WHITE, ML_WHITE);
                        }
                        if (g_x > 58 && g_x < 63 && g_y > 54) {
                            ML_rectangle(100, 49, 105, 56, 0, ML_WHITE, ML_WHITE);
                            ML_rectangle(58, 58, 63, 61, 0, ML_WHITE, ML_WHITE);
                        }
                        SaveDisp(1);
                    }
                    if (ML_pixel_test(g_x + lb, g_y + la) == ML_BLACK) // Check again, level 7 might have cleared it
                    {
                        if (g_level == 8 && g_x < 60 && g_y > 25 && g_y < 45) { g_boom = 41; ML_rectangle(35, 40, 37, 26, 0, ML_WHITE, ML_WHITE); SaveDisp(1); }
                        if (g_level == 8 && g_y > 45 && g_x < 40) { g_boom2 = 60; ML_rectangle(25, 59, 27, 48, 0, ML_WHITE, ML_WHITE); SaveDisp(1); }
                        if (g_level == 8 && g_y > 45 && g_x > 50) { g_boom3 = 125; ML_rectangle(50, 55, 127, 62, 0, ML_WHITE, ML_WHITE); SaveDisp(1); } // boom3 starts at 125, so this makes it effectively 125.
                        for (g_poc = 0; g_poc < 20; g_poc++) {
                            ML_bmp_or(g_bam, g_x - 5, g_y - 4, 7, 7);
                            ML_display_vram();
                            await Sleep(2);
                            ML_clear_vram();
                            RestoreDisp(1);
                            ML_bmp_or(g_bam2, g_x - 5, g_y - 4, 7, 7);
                            ML_display_vram();
                            await Sleep(2);
                            ML_clear_vram();
                            RestoreDisp(1);
                            ML_bmp_or(g_bam3, g_x - 5, g_y - 4, 7, 7);
                            ML_display_vram();
                            await Sleep(2);
                            ML_clear_vram();
                            RestoreDisp(1);
                        }
                        switch (g_sens)//retour au debut du niveau
                        {
                            case 1: g_x = 5; g_y = 19 * g_d + 3; break;
                            case -1: g_x = 122; g_y = 19 * g_d + 3; break;
                        }
                        g_death++;
                        g_go = 1;
                        g_omg = g_death;
                        ML_rectangle(1, 0, 47, 5, 1, ML_WHITE, ML_WHITE); // Clear death counter area
                        for (g_op = 1000; g_op > .1; g_op = g_op / 10) {
                            g_yo = Math.floor(g_omg / g_op);
                            g_omg = ((g_omg / g_op) - (Math.floor(g_omg / g_op))) * g_op;
                            if (g_yo >= 1 || g_go > 2) {
                                PrintMini(g_go, 0, g_score_chars[g_yo], 1);
                                ML_rectangle(g_go + 3, 0, 47, 5, 1, ML_WHITE, ML_WHITE); // Clear after printed digit
                                ML_rectangle(45, 0, 90, 5, 1, ML_WHITE, ML_WHITE); // Clear level text area
                                switch (g_level)                                             //ceci est honteux mais quand on l'enlève j'obtient un bug inexpliqué et trsè ch*ant
                                {
                                    case 1: PrintMini(50, 0, "1/15", 1); break;
                                    case 2: PrintMini(50, 0, "2/15", 1); break;
                                    case 3: PrintMini(50, 0, "3/15", 1); break;
                                    case 4: PrintMini(50, 0, "4/15", 1); break;
                                    case 5: PrintMini(50, 0, "5/15", 1); break;
                                    case 6: PrintMini(50, 0, "6/15", 1); break;
                                    case 7: PrintMini(50, 0, "7/15", 1); break;
                                    case 8: PrintMini(50, 0, "8/15", 1); break;
                                    case 9: PrintMini(50, 0, "9/15", 1); break;
                                    case 10: PrintMini(50, 0, "10/15", 1); break;
                                    case 11: PrintMini(50, 0, "11/15", 1); break;
                                    case 12: PrintMini(50, 0, "12/15", 1); break;
                                    case 13: PrintMini(50, 0, "13/15", 1); break;
                                    case 14: PrintMini(50, 0, "14/15", 1); break;
                                    case 15: PrintMini(50, 0, "15/15", 1); break;
                                }
                                SaveDisp(1);
                                g_go = g_go + 4;
                            }
                        }


                    }
                }
                RestoreDisp(1);
            }
        }
        //fin pixel test
        ML_point(g_x, g_y, 4, ML_BLACK);
        if (g_level == 1)                                                                        // les commentaires en jeu
        {
            if (g_y < 25) { PrintMini(1, 8, "HIT THE CROSS TO MOVE DOWN", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "MOVING FROM RIGHT TO LEFT", 1); }
            if (g_x < 70 && g_y > 45) { PrintMini(1, 46, "[EXE] TO JUMP", 1); }
            if (g_x > 70 && g_y > 45) {
                PrintMini(1, 46, "                         ", 1);
                PrintMini(70, 46, "GOOD LUCK", 1);
            }
        }
        if (g_level == 2) {
            if (g_y < 25) {
                PrintMini(1, 8, "HMM, CAN YOU DO THIS?", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "HOW ABOUT THIS?", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "GETTING THE HANG OF IT!", 1);
            }
        }
        if (g_level == 3) {
            if (g_y < 25) { PrintMini(1, 8, "YOU CAN DO IT!!", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "THE TRIPLE JUMP!", 1); }
            if (g_x < 100 && g_y > 45) { PrintMini(1, 46, "CAN YOU FIT?", 1); }
            if (g_x > 100 && g_y > 45) {
                PrintMini(1, 46, "                         ", 1);
                PrintMini(100, 46, "YAY!", 1);
            }
        }
        if (g_level == 4) {
            if (g_y < 25) {
                PrintMini(1, 8, "GOING FOR DOUBLES", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "OOH, TUNNEL!", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "TRIPLE JUMP V2.0", 1);
            }
        }
        if (g_level == 5) {
            if (g_y < 25) {
                PrintMini(1, 8, "BIG, SMALL, BIG!", 1);
            }
            if (g_x > 40 && g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "URGH, MORE TUNNELS", 1);
            }
            if (g_x < 40 && g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "BET YOU LOVE THEM ^^", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "THE REVERSE TUNNEL!", 1);
            }
        }
        if (g_level == 6) {
            if (g_x < 60 && g_y < 25) {
                PrintMini(1, 8, "STEPS!", 1);
            }
            if (g_x > 60 && g_y < 25) {
                PrintMini(1, 8, "            MORE STEPS!", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "THIS IS EASY ON PURPOSE", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "DO ITTT!", 1);
            }
        }
        if (g_level == 7) {
            if (g_x < 80 && g_y < 25) {
                PrintMini(1, 8, "COLLECT THE PIXEL!", 1);
            }
            if (g_x > 80 && g_y < 25) {
                PrintMini(1, 8, "                    MAGIC!", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "YOU KNOW THE DRILL...", 1);
            }
            if (g_x > 60 && g_y > 45) {
                PrintMini(1, 46, "SURPRISE!", 1);
            }
        }
        if (g_level == 9) {
            if (g_y < 25) { PrintMini(1, 8, "WELCOME TO HELL!", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "IT'S PRETTY EASY REALLY!", 1); }
            if (g_y > 45) { PrintMini(1, 46, "HELL IS KINDA FUN!", 1); }
        }
        if (g_level == 8) {
            if (g_y < 25) { PrintMini(1, 8, "WHAT ELSE CAN I SAY?", 1); }
            if (g_x < 50 && g_y < 45 && g_y > 25) // Note: x not g_x in C original. Assuming g_x.
            { PrintMini(1, 27, "SORRY!", 1); }
        }
        if (g_level == 10) {
            if (g_y < 25) { PrintMini(1, 8, "EASY PEASY!", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "SO IS THIS!", 1); }
            if (g_y > 45) { PrintMini(1, 46, "THIS ISN'T...", 1); }
        }
        if (g_level == 11) {
            if (g_y < 25) {
                PrintMini(1, 8, "SUPER JUMP!", 1);
            }
            if (g_x > 50 && g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "USED TO IT YET?", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "OH NO YOU DIDN'T!", 1);
            }
        }
        if (g_level == 12) {
            if (g_y < 25) {
                PrintMini(1, 8, "BOOYAH!", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "OH REALLY?", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "BOUNCY BOUNCY BOUNCY!", 1);
            }
        }
        if (g_level == 13) {
            if (g_y < 25) {
                PrintMini(1, 8, "SURE YOU CAN DO THIS?", 1);
            }
            if (g_y < 45 && g_y > 25) {
                PrintMini(1, 27, "DON'T DIE ON ME!", 1);
            }
            if (g_y > 45) {
                PrintMini(1, 46, "GO GO! WOOHOO!", 1);
            }
        }
        if (g_level == 14) {
            if (g_y < 25) { PrintMini(1, 8, "EASY AS PIE!", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "Mmmm PIE...", 1); }
            if (g_y > 45) { PrintMini(1, 46, "WANT A SLICE?", 1); }
        }
        if (g_level == 15) {
            if (g_y < 25) { PrintMini(1, 8, "YOU'RE PRETTY GOOD!", 1); }
            if (g_y < 45 && g_y > 25) { PrintMini(1, 27, "DO IT, DO IT!", 1); }
            if (g_y > 45) { PrintMini(1, 46, "THIS IS THE FINAL!", 1); }
        }



    } // fin de "jeu()"

    //****************************************************************************
    //  AddIn_main (Sample program main function)
    //
    //  param   :   isAppli   : 1 = This application is launched by MAIN MENU.
    //                        : 0 = This application is launched by a strip in eACT application.
    //
    //              OptionNum : Strip number (0~3)
    //                         (This parameter is only used when isAppli parameter is 0.)
    //
    //  retval  :   1 = No error / 0 = Error
    //
    //****************************************************************************
    async function AddIn_main(isAppli: number, OptionNum: number): Promise<number> {
        let key: number;

        while (g_level - 15 && g_stop) // C: (level-15) is non-zero (true) if level != 15.
        {
            g_level++;
            await niveaux();
            g_bout = 1; // Level in progress flag
            g_x = 5; // Reset player state for new level
            g_y = 22;
            g_sens = 1;
            g_d = 1; // Reset current floor for new level (was set in niveaux, but needs to be reset here for game loop logic)
            g_boom = 26; // Reset level 8 specific vars
            g_boom2 = 48;
            g_boom3 = 125;
            while (g_bout && g_stop) // While level in progress and game not stopped
            {
                await jeu();
                if (IsKeyDown(KEY_CTRL_EXIT)) // Pause / Exit check
                {
                    ML_point(g_x, g_y, 4, ML_WHITE); // Clear player before pause
                    let key = null;
                    while (key !== KEY_CTRL_EXE) {
                        ML_rectangle(48, 25, 75, 33, 1, ML_BLACK, ML_WHITE); // C: while(IsKeyDown(KEY_CTRL_EXE)==0) loop, means "while EXE is NOT down"
                        PrintMini(50, 27, "PAUSE", MINI_REV);
                        key = await GetKey(); // Wait for a key press to unpause (any key)
                        switch (g_sens)//retour au debut du niveau
                        {
                            case 1: g_x = 5; g_y = 19 * g_d + 3; break;
                            case -1: g_x = 122; g_y = 19 * g_d + 3; break;
                        }
                        ML_point(g_x, g_y, 4, ML_BLACK); // Draw player at reset position
                        ML_display_vram();
                    } // End of inner while loop (pause screen)
                    await Sleep(800); // After EXE is pressed (to unpause), sleep.
                }
                ML_display_vram();
                await Sleep(g_speed);
            }
        }
        if (g_stop) // If game ended normally (not by EXIT from main loop, or level 15 completed)
        {
            ML_clear_vram();
            locate(6, 2);
            Print("YOU DID IT" as any);
            locate(3, 4);
            Print("CONGRATULATIONS!!!!" as any);
            locate(6, 6);
            Print("DEATH : " as any);
            g_go = 14; // Starting column for death count
            g_omg = g_death;
            for (g_op = 1000; g_op > .1; g_op = g_op / 10) {
                g_yo = Math.floor(g_omg / g_op);
                g_omg = ((g_omg / g_op) - (Math.floor(g_omg / g_op))) * g_op;
                if (g_yo >= 1 || g_go > 14) // Print if digit is non-zero OR if we've already started printing (go > 14)
                {
                    locate(g_go, 6);
                    Print(g_score_chars[g_yo] as any); // C: Print(&score[yo])
                    // ML_rectangle(5*g_go+16+(g_go-15),38,127,55,1,ML_WHITE,ML_WHITE); // This seems to be an attempt to clear screen area, coords are complex
                    // Simplified: ML_rectangle(some_x, some_y, 127, 55, 1, ML_WHITE, ML_WHITE); The X part looks suspicious.
                    // For faithfulness:
                    ML_rectangle(5 * g_go + 16 + (g_go - 15), 38, 127, 55, 1, ML_WHITE, ML_WHITE);
                    g_go++;
                }
            }
            if (g_death == 0) // Special case for 0 deaths
            {
                locate(14, 6);
                Print("0" as any);
            }
            ML_display_vram();
        }
        while (true) { // C: while(1)

            key = await GetKey(); // Wait for key, presumably to exit to menu after game over
        }

        return 1;
    }

    return { AddIn_main };

}
