export default function evasion_survival({
    KEY_CTRL_UP: K_UP,
    KEY_CTRL_DOWN: K_DOWN,
    KEY_CTRL_LEFT: K_LEFT,
    KEY_CTRL_RIGHT: K_RIGHT,
    KEY_CTRL_EXIT: K_EXIT,
    KEY_CTRL_EXE: K_EXE,
    rand,
    dispStr,
    PopUpWin,
    ML_rectangle,
    ML_line,
    ML_point,
    ML_circle,
    ML_filled_circle,
    ML_bmp_or,
    ML_bmp_8_or,
    ML_display_vram,
    ML_clear_vram,
    ML_BLACK,
    ML_WHITE,
    ML_TRANSPARENT,
    IsKeyDown: key_down,
    Bfile_OpenFile,
    Bfile_ReadFile,
    Bfile_SeekFile,
    Bfile_WriteFile,
    Bfile_CreateFile,
    Bfile_CloseFile,
    Bfile_DeleteFile,
    Sleep,
    PrintXY,
    _OPENMODE_READ,
    _OPENMODE_WRITE,
}) {

    function PrintMini(x: number, y: number, str: string, color: number): void {
        dispStr(str, x, y-1, 99999999);
    }

    async function setFps(fps) {
        await Sleep(1000 / fps);
    }

    class Bomb {
        // private: // C++ access specifier translated to 'private' keyword below
        private positionX: number[];
        private positionY: number[];
        private taille: number[];
        private nombre: number;

        // public: // C++ access specifier; members are public by default in TypeScript
        constructor() {
            this.nombre = -1;
            this.positionX = new Array(50);
            this.positionY = new Array(50);
            this.taille = new Array(50);
        }

        nouveau(): void {
            this.nombre++;
            this.positionX[this.nombre] = rand() % 100;
            this.positionY[this.nombre] = rand() % 58;
            this.taille[this.nombre] = -72;
        }

        free(): void {
            for (let a: number = 0; a < this.nombre; a++) {
                if (this.taille[a] > 35) {
                    this.nombre--;
                    for (let b: number = a; b <= this.nombre; b++) {
                        this.positionX[b] = this.positionX[b + 1];
                        this.positionY[b] = this.positionY[b + 1];
                        this.taille[b] = this.taille[b + 1];
                    }
                }
            }
        }

        affichage(): void {
            for (let a: number = 0; a < this.nombre; a++) {
                if (this.taille[a] <= 6) { ML_rectangle(this.positionX[a], this.positionY[a], this.positionX[a] + 6, this.positionY[a] + 6, 1, ML_BLACK, ML_TRANSPARENT); PrintV(this.positionX[a] + 2, this.positionY[a] + 1, Math.abs(Math.trunc((this.taille[a] - 6) / 26)) + 1); }
                else if (this.taille[a] < 20) ML_rectangle(this.positionX[a] - this.taille[a] + 6, this.positionY[a] - this.taille[a] + 6, this.positionX[a] + this.taille[a], this.positionY[a] + this.taille[a], 3, ML_BLACK, ML_TRANSPARENT);
                else if (this.taille[a] < 35) ML_rectangle(this.positionX[a] - 14, this.positionY[a] - 14, this.positionX[a] + 20, this.positionY[a] + 20, 3, ML_BLACK, ML_TRANSPARENT);
            }
        }

        deplacement(): void {
            for (let a: number = 0; a < this.nombre; a++)this.taille[a]++;
        }

        collision(X: number, Y: number): boolean {

            for (let a: number = 0; a < this.nombre; a++)if (this.taille[a] > 6 && this.taille[a] < 20) if (!((X >= this.positionX[a] + this.taille[a]) || (X + 2 <= this.positionX[a] - this.taille[a] + 6) || (Y >= this.positionY[a] + this.taille[a]) || (Y + 2 <= this.positionY[a] - this.taille[a] + 6))) return true;
            for (let a: number = 0; a < this.nombre; a++)if (this.taille[a] > 19 && this.taille[a] < 35) if (!((X >= this.positionX[a] + 20) || (X + 2 <= this.positionX[a] - 14) || (Y >= this.positionY[a] + 20) || (Y + 2 <= this.positionY[a] - 14))) return true;
            return false;
        }
    }


    class Follower {
        // public:

        // private:

        private positionX: number[];
        private positionY: number[];
        private nombre: number;
        private directionX: number[];
        private directionY: number[];

        constructor() {
            this.positionX = new Array(50);
            this.positionY = new Array(50);
            this.directionX = new Array(50);
            this.directionY = new Array(50);
            this.nombre = -1;
            for (let a: number = 0; a < 50; a++) {
                this.positionX[a] = -5;
                this.positionY[a] = -5;
                this.directionX[a] = 0;
                this.directionY[a] = 0;
            }
        }

        free(): void {
            for (let a: number = 0; a < this.nombre; a++) {
                if (this.positionX[a] < -1 || this.positionX[a] > 130 || this.positionY[a] < -1 || this.positionY[a] > 65) {
                    this.nombre--;
                    for (let b: number = a; b <= this.nombre; b++) {
                        this.positionX[b] = this.positionX[b + 1];
                        this.positionY[b] = this.positionY[b + 1];
                        this.directionX[b] = this.directionX[b + 1];
                        this.directionY[b] = this.directionY[b + 1];
                    }
                }
            }
        }

        collision(X: number, Y: number): boolean {
            for (let a: number = 0; a < this.nombre; a++)
                if (X <= this.positionX[a] && X + 2 >= this.positionX[a] && Y <= this.positionY[a] && Y + 2 >= this.positionY[a]) return true;
            return false;
        }

        deplacement(): void {
            for (let a: number = 0; a < this.nombre; a++) {

                ML_line(this.positionX[a] - this.directionX[a], this.positionY[a] - this.directionY[a], this.positionX[a] + this.directionX[a], this.positionY[a] + this.directionY[a], ML_BLACK);
                this.positionX[a] += this.directionX[a];
                this.positionY[a] += this.directionY[a];
            }
        }

        nouveau(X: number, Y: number): void {
            let pente: number;
            this.nombre++;
            if (rand() % 2) {
                this.positionX[this.nombre] = rand() % 128;
                this.positionY[this.nombre] = (rand() % 2) * 64;
            }
            else {
                this.positionY[this.nombre] = rand() % 64;
                this.positionX[this.nombre] = (rand() % 2) * 128;
            }
            // C++: (this.positionX[this.nombre]>X) is 0 or 1 in arithmetic context. TS: (condition ? 1 : 0)
            if (Y == this.positionY[this.nombre]) { this.directionX[this.nombre] = -2 + (4 * (this.positionX[this.nombre] > X ? 1 : 0)); this.directionY[this.nombre] = 0; return; }
            // C++ integer division:
            pente = Math.trunc(2 * (X - this.positionX[this.nombre]) / (Y - this.positionY[this.nombre]));
            if (pente >= 2.5) {
                this.directionX[this.nombre] = 2;
                this.directionY[this.nombre] = 1;
            }
            if (pente < 2.5) {
                this.directionX[this.nombre] = 1;
                this.directionY[this.nombre] = 1;
            }
            if (pente < 1.5) {
                this.directionX[this.nombre] = 1;
                this.directionY[this.nombre] = 2;
            }
            if (pente == 0) {
                this.directionX[this.nombre] = 0;
                this.directionY[this.nombre] = 2;
            }
            if (pente < -0.5) {
                this.directionX[this.nombre] = -1;
                this.directionY[this.nombre] = 2;
            }
            if (pente < -1.5) {
                this.directionX[this.nombre] = -1;
                this.directionY[this.nombre] = 1;
            }
            if (pente < -3) {
                this.directionX[this.nombre] = -2;
                this.directionY[this.nombre] = 1;
            }
            if (this.positionY[this.nombre] > Y) { this.directionX[this.nombre] = -this.directionX[this.nombre]; this.directionY[this.nombre] = -this.directionY[this.nombre]; }
        }
    }

    class Heros {
        // public :

        // private :
        private positionX: number;
        private positionY: number;
        private dx: number;
        private dy: number;

        constructor() {
            this.positionX = 50;
            this.positionY = 50;
            this.dx = 0;
            this.dy = 0;
        }

        input(): void {
            if (key_down(K_UP) && this.dy > -15) this.dy -= 5;
            if (key_down(K_DOWN) && this.dy < 15) this.dy += 5;
            if (key_down(K_LEFT) && this.dx > -15) this.dx -= 5;
            if (key_down(K_RIGHT) && this.dx < 15) this.dx += 5;
        }

        affichage(follower: Follower, wall: Wall, bomb: Bomb): number {
            let a: number;
            let retour: number = 0;
            if (this.positionX + this.dx < 10 || this.positionX + this.dx > 1060) this.dx -= 2 * this.dx;
            if (this.positionY + this.dy < 10 || this.positionY + this.dy > 630) this.dy -= 2 * this.dy;

            for (a = 0; (a < Math.abs(this.dx) || a < Math.abs(this.dy)) || a < 2; a++) {
                if (a < Math.abs(this.dx)) { if (this.dx >= 0) this.positionX++; else this.positionX--; }
                if (a < Math.abs(this.dy)) { if (this.dy >= 0) this.positionY++; else this.positionY--; }
                // C++ integer division for coordinates:
                if (follower.collision(Math.trunc(this.positionX / 10), Math.trunc(this.positionY / 10))) retour = 1;
                if (wall.collision(Math.trunc(this.positionX / 10), Math.trunc(this.positionY / 10))) retour = 1;
                if (bomb.collision(Math.trunc(this.positionX / 10), Math.trunc(this.positionY / 10))) retour = 1;
            }

            // C++ integer division:
            this.dx = Math.trunc(95 * this.dx / 100);
            this.dy = Math.trunc(95 * this.dy / 100);
            ML_point(Math.trunc(this.positionX / 10), Math.trunc(this.positionY / 10), 3, ML_BLACK);
            return retour;
        }

        affichageMenu(): void {
            let a: number;
            if (this.positionX + this.dx < 10 || this.positionX + this.dx > 1270) this.dx -= 2 * this.dx;
            if (this.positionY + this.dy < 10 || this.positionY + this.dy > 630) this.dy -= 2 * this.dy;

            for (a = 0; (a < Math.abs(this.dx) || a < Math.abs(this.dy)); a++) {
                if (a < Math.abs(this.dx)) { if (this.dx >= 0) this.positionX++; else this.positionX--; }
                if (a < Math.abs(this.dy)) { if (this.dy >= 0) this.positionY++; else this.positionY--; }
            }

            // C++ integer division:
            this.dx = Math.trunc(95 * this.dx / 100);
            this.dy = Math.trunc(95 * this.dy / 100);
            ML_point(Math.trunc(this.positionX / 10), Math.trunc(this.positionY / 10), 3, ML_BLACK);
        }

        getX(): number {
            // C++ integer division:
            return Math.trunc(this.positionX / 10);
        }
        getY(): number {
            // C++ integer division:
            return Math.trunc(this.positionY / 10);
        }
    }

    class jeu {
        // public:

        // private:

        async game(f: number, e: number, c: number, secret: number, type: number): Promise<number> {
            //pour l'explosion de mort
            const explosionUn: number[] = [0, 44, 82, 74, 129, 110, 48, 0];
            const explosionDeux: number[] = [6, 105, 66, 136, 2, 33, 132, 99];
            const explosionTrois: number[] = [8, 65, 16, 132, 0, 0, 17, 130];
            let niveau_: number = 1;
            if (f && e && c) niveau_ = 6;
            if (f && e && !c) niveau_ = 5;
            if (f && !e && c) niveau_ = 4;
            if (!f && !c) niveau_ = 3;
            if (!f && !e) niveau_ = 2;
            niveau_--;
            let touche: number = 0;
            /* initialisation des variables*/
            let key: number; // unused
            let frame: number = 10;
            let vitesse: number = 36;
            let temps: number = 0;
            let retour: number = 0;
            let positionBalleX: number = rand() % 90 + 5;
            let positionBalleY: number = rand() % 55 + 5;
            let heros: Heros = new Heros();
            let point: score = new score();
            let follower: Follower = new Follower();
            let wall: Wall = new Wall();
            let bomb: Bomb = new Bomb();
            let mort: number = 0;
            let nounours: Nounours = new Nounours();
            let n: number = rand() % 10;
            if (n != 5) n = 0;
            if (secret != 1) n = 0;
            if (n) nounours.nouveau();
            if (c) wall.nouveau();
            wall.nouveau();
            point.loadScore();
            point.setType(type);//regle si le jeu etait normale ou bonus
            /*boucle principale*/
            while (mort != 1)//stop quand l'animation de la mort s'arrete
            {
                frame++;
                /*creation*/
                // C++ integer division for vitesse/N:
                if (!(frame % Math.trunc(vitesse / 2)) && f) { follower.free(); follower.nouveau(heros.getX(), heros.getY()); }
                if (!(frame % Math.trunc(vitesse / 2)) && e) { bomb.free(); bomb.nouveau(); }
                if ((!(frame % Math.trunc(vitesse / 6))) && c) { temps++; wall.deplacement(); }
                if (c && (temps == 14)) { wall.free(); wall.nouveau(); temps = 0; }
                /*input et deplacement*/
                if (frame % 2 && !mort) heros.input();
                if (f) follower.deplacement();
                if (e) bomb.deplacement();
                if (n) nounours.deplacement();
                /*affichage*/
                if (c) wall.affichage();
                if (e) bomb.affichage();
                if (n) nounours.affichage();
                point.affichage();
                if (!mort) if (heros.affichage(follower, wall, bomb)) mort = 24;
                if (n && nounours.collision(heros.getX(), heros.getY())) { retour = 1; n = 0; }
                if (heros.getX() > 103 && c && secret == 2) touche++;
                if (mort)//animation de mort
                {
                    if (mort > 16) ML_bmp_8_or(explosionUn, heros.getX() - 3, heros.getY() - 3);
                    if (mort > 8) ML_bmp_8_or(explosionDeux, heros.getX() - 3, heros.getY() - 3);
                    if (mort > 1) ML_bmp_8_or(explosionTrois, heros.getX() - 3, heros.getY() - 3);
                    mort--;
                }
                if (type)//bonus
                {
                    ML_filled_circle(positionBalleX, positionBalleY, 4, ML_BLACK);
                    let d2: number = (heros.getX() + 1 - positionBalleX) * (heros.getX() + 1 - positionBalleX) + (heros.getY() + 1 - positionBalleY) * (heros.getY() + 1 - positionBalleY);
                    if (!(d2 > 16)) {
                        for (let a: number = 0; a < (150 * e + 100 * f + 100 * c); a++)point.incrementation();
                        positionBalleX = rand() % 90 + 5;
                        positionBalleY = rand() % 55 + 5;
                    }
                }

                ML_display_vram();
                ML_clear_vram();
                await setFps(26);
                if (frame == 60) { vitesse -= 1; frame -= 60; }//augmentation de la difficulté
                if (!type && !mort) {
                    if (c) point.incrementation();
                    if (e) point.incrementation();
                    if (f) point.incrementation();
                }//augmente les points
                if (key_down(K_EXIT)) break;
            }
            do {
                PopUpWin(6);
                if (!point.newBest(niveau_)) PrintMini(11, 5, "Game Over!", 1);
                else PrintMini(11, 5, "nouveau record !", 1);
                PrintMini(11, 12, "votre score:", 1);
                PrintV(66, 12, point.getScore());
                if (point.getScore() >= 1500) {
                    PrintMini(11, 21, "vous avez obtenu une ", 1); PrintMini(11, 27, "medaille d'or !", 1);
                    PrintMini(11, 33, "magnifique! c'est la", 1); PrintMini(11, 39, "plus haute recompense !", 1); PrintMini(11, 45, "vous pouvez etre fier ", 1); PrintMini(11, 51, "de vous !", 1);
                }
                else if (point.getScore() >= 1000) {
                    PrintMini(11, 21, "vous avez obtenu une ", 1); PrintMini(11, 27, "medaille d'argent !", 1);
                    PrintMini(11, 33, "bravo! je suis sur", 1); PrintMini(11, 39, "que vous obtiendrez la", 1); PrintMini(11, 45, "medaille d'or bientot !", 1);
                }
                else if (point.getScore() >= 500) {
                    PrintMini(11, 21, "vous avez obtenu une ", 1); PrintMini(11, 27, "medaille de bronze !", 1);
                    PrintMini(11, 33, "c'est bien, mais je suis", 1); PrintMini(11, 39, "sur que vous pouvez", 1); PrintMini(11, 45, "faire mieux !", 1);
                }
                else {
                    PrintMini(11, 21, "vous n'avez rien obtenu", 1);
                    PrintMini(11, 33, "courage ! je suis sur que", 1); PrintMini(11, 39, "vous pouvez obtenir", 1); PrintMini(11, 45, "un medaille !", 1);
                }
                ML_display_vram();//affichage des scores
                await Sleep(10);
            } while (!key_down(K_EXE));

            while (key_down(K_EXE)) {await Sleep(10); } // wait for key release;
            point.saveScore();
            if (touche > 4) retour = 2;//si on a touche suffisement le mur du fond pour un succes
            return retour;
        }
    }

    class Nounours {
        // public:

        // private:
        private positionX: number;
        private positionY: number;

        constructor() {
            // Initialize to default values, C++ might leave them uninitialized for local objects
            // but they are only accessed if nounours.nouveau() is called via the 'n' flag logic.
            // If not called, they are not read. So this initialization is for TS strictness/safety.
            this.positionX = 0;
            this.positionY = 0;
        }

        affichage(): void {
            const space_invader: number[] = [0x20, 0x80, 0x11, 0x00, 0x3F, 0x80, 0x6E, 0xC0, 0xFF, 0xE0, 0xBF, 0xA0, 0xA0, 0xA0, 0x1B, 0x00];
            ML_bmp_or(space_invader, this.positionX, this.positionY, 11, 8);
        }

        deplacement(): void {
            this.positionX--;
        }

        collision(X: number, Y: number): boolean {
            if ((X >= this.positionX + 11)      // trop à droite
                || (X + 2 <= this.positionX) // trop à gauche
                || (Y >= this.positionY + 8) // trop en bas
                || (Y + 2 <= this.positionY))  // trop en haut
                return false;
            else
                return true;
        }

        nouveau(): void {
            this.positionY = (rand() % 50) + 1;
            this.positionX = (rand() % 750) + 250;
        }
    }


    class score {
        // public:
        constructor() {
            this.resultat = new Array(12);
            for (let a: number = 0; a < 12; a++) {
                this.resultat[a] = 0;
            }
            this.point = 0;
            // FONTCHARACTER temp[20] ={'\\','\\','f','l','s','0','\\','e','v','a','s','i','o','n','.','s','c','o',0};
            const temp_str: string = "\\\\fls0\\evasion.sco";
            this.filename = temp_str;
            this.type = 0;
        }

        affichage(): void {
            let pourcent: number;
            ML_rectangle(107, -2, 130, 65, 1, ML_BLACK, ML_WHITE);
            this.medaille(1, 112, 3);
            this.medaille(2, 112, 17);
            this.medaille(3, 112, 31);
            PrintMini(109, 45, "point", 1);
            PrintV(109, 51, this.point); // Uses the faithful PrintV defined later
            pourcent = Math.trunc(this.point / 5);
            if (pourcent > 99) pourcent = 100;
            PrintPour(110, 8, pourcent); // Uses the faithful PrintPour defined later
            pourcent = Math.trunc(this.point / 10);
            if (pourcent > 99) pourcent = 100;
            PrintPour(110, 22, pourcent);
            pourcent = Math.trunc(this.point / 15);
            if (pourcent > 99) pourcent = 100;
            PrintPour(110, 36, pourcent);
        }

        incrementation(): void {
            this.point++;
        }

        getScore(): number {
            return this.point;
        }

        medaille(taille: number, x: number, y: number): void {
            ML_circle(x, y, 3, ML_BLACK);
            if (taille > 1) { ML_line(x - 1, y - 1, x - 1, y + 2, ML_BLACK); ML_line(x + 1, y - 1, x + 1, y + 2, ML_BLACK); }
            if (taille != 2) ML_line(x, y - 1, x, y + 2, ML_BLACK);
        }

        getScoreTotal(): number {
            let retour: number = 0;
            for (let a: number = 6 * this.type; a < (6 + 6 * this.type); a++)retour += this.resultat[a];
            return retour;
        }

        getScoreGame(wich: number): number {
            return this.resultat[wich + 6 * this.type];
        }

        medailleScore(temp: number, x: number, y: number): void {
            if (temp < 500) return;
            this.medaille(Math.trunc(temp / 500), x, y);
        }

        loadScore(): number {
            this.handle = Bfile_OpenFile(this.filename, _OPENMODE_READ);
            if (this.handle > -1) {
                Bfile_ReadFile(this.handle, this.resultat, 48, 0);
            }
            Bfile_CloseFile(this.handle);
            if (this.handle > -1) return 0;
            return 1;
        }

        newBest(wich: number): number {
            if ((this.resultat[wich + (6 * this.type)] - 1) < this.point) { this.resultat[wich + 6 * this.type] = this.point; return 1; }
            return 0;
        }

        saveScore(): number {
            Bfile_DeleteFile(this.filename);
            Bfile_CreateFile(this.filename, this.resultat.length);
            this.handle = Bfile_OpenFile(this.filename, _OPENMODE_WRITE);
            Bfile_WriteFile(this.handle, this.resultat, this.resultat.length);
            Bfile_CloseFile(this.handle);
            return 0;
        }

        getTableau(): number[] {
            return this.resultat;
        }

        setType(wich: number): void {
            if (wich == 0)
                this.type = 0;
            else this.type = 1;
        }

        // private:
        private filename: string;
        private handle: number;
        private point: number;
        private resultat: number[];
        private type: number;
    };

    async function RectangleHorizontal(): Promise<void> {
        let a: number;
        for (a = 0; a < 32; a++) {
            ML_rectangle(-1, a, 129, 63 - a, 1, ML_BLACK, ML_TRANSPARENT);
            ML_display_vram();
            await Sleep(20);
        }
    }

    async function RectangleVertical(): Promise<void> {
        let a: number;
        for (a = 0; a < 64; a++) {
            ML_rectangle(a, -1, 127 - a, 66, 1, ML_BLACK, ML_TRANSPARENT);
            ML_display_vram();
            await Sleep(10);
        }
    }

    async function Rectangle(x: number, y: number): Promise<void> {
        let a: number;
        for (a = -64; a < 64; a++) {
            ML_rectangle(x - 64 + a, -1, x + 64 - a, 66, 1, ML_BLACK, ML_TRANSPARENT);
            ML_rectangle(-1, (y - 32 + Math.trunc(a / 2)), 129, (y - Math.trunc(a / 2) + 32), 1, ML_BLACK, ML_TRANSPARENT);
            ML_display_vram();
            await Sleep(2);
        }
    }
    function Cercle1(X: number, Y: number): void {
        let a: number;
        for (a = 200; a > 0; a -= 1) {
            ML_circle(X, Y, a, ML_BLACK);
            ML_display_vram();
        }
    }

    const BEST_F = 1563;
    const BEST_E = 1720;
    const BEST_C = 1667;
    const BEST_C_F = 2105;
    const BEST_F_E = 1690;
    const BEST_ALL = 1545;
    const NB_TROPHEE = 16;
    const NB_SUCCES = 9;

    class Trophee {
        // public:
        constructor() {
            const tempSucc_str: string = "\\\\fls0\\evasion.suc";
            this.filenameSucces = tempSucc_str;

            const coupe_noire_data: number[] = [0x1F, 0xC0, 0xFF, 0xF8, 0xBF, 0xE8, 0xBF, 0xE8, 0x7F, 0xF0, 0x3F, 0xE0, 0x1F, 0xC0, 0x0F, 0x80, 0x07, 0x00, 0x07, 0x00, 0x07, 0x00, 0x07, 0x00, 0x1F, 0xC0, 0x3F, 0xE0, 0x3F, 0xE0, 0x1F, 0xC0];
            const coupe_blanche_data: number[] = [0x1F, 0xC0, 0xE0, 0x38, 0xA0, 0x28, 0xA0, 0x28, 0x60, 0x30, 0x20, 0x20, 0x10, 0x40, 0x0F, 0x80, 0x05, 0x00, 0x05, 0x00, 0x05, 0x00, 0x05, 0x00, 0x1D, 0xC0, 0x27, 0x20, 0x20, 0x20, 0x1F, 0xC0];
            this.coupeNoire = new Array(32);
            this.coupe = new Array(32);
            for (let a: number = 0; a < 32; a++) {
                this.coupeNoire[a] = coupe_noire_data[a];
                this.coupe[a] = coupe_blanche_data[a];
            }

            this.trophee = new Array(NB_TROPHEE);
            for (let a: number = 0; a < 16; a++) {
                this.trophee[a] = false;
            }
            this.succes = new Array(NB_SUCCES);
            for (let a: number = 0; a < 8; a++) {
                this.succes[a] = false;
            }
            // this.succes[8] is used for NB_secret, ensure NB_SUCCES is large enough (e.g., 9)
            if (NB_SUCCES > 8) { // Defensive initialization for the slot used by NB_secret
                this.succes[8] = false;
            }
            this.NB_secret = 0;
        }

        tester(): void {
            let handle: number;
            const filename_1_str: string = "\\\\fls0\\PlantvsZ.sav";
            const filename_2_str: string = "\\\\fls0\\Saviors1.sav";
            const filename_3_str: string = "\\\\fls0\\Saviors2.sav";
            const filename_4_str: string = "\\\\fls0\\Saviors3.sav";
            const filename_5_str: string = "\\\\fls0\\worlded1.wor";
            const filename_6_str: string = "\\\\fls0\\worlded2.wor";
            const filename_7_str: string = "\\\\fls0\\worlded3.wor";
            const filename_8_str: string = "\\\\fls0\\worlded4.wor";
            const filename_9_str: string = "\\\\fls0\\worlded5.wor";
            const filename_10_str: string = "\\\\fls0\\worlded6.wor";

            handle = Bfile_OpenFile(filename_1_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_2_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_3_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_4_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_5_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_6_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_7_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_8_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_9_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
            handle = Bfile_OpenFile(filename_10_str, _OPENMODE_READ);
            if (handle > -1) { this.succes[6] = true; Bfile_CloseFile(handle); }
        }

        load(): void {
            this.handle = Bfile_OpenFile(this.filenameSucces, _OPENMODE_READ);
            if (this.handle > -1) {
                Bfile_ReadFile(this.handle, this.succes, NB_SUCCES * 4, 0);
                Bfile_CloseFile(this.handle);
                this.NB_secret = this.succes[8] ? 1 : 0;
            }
        }

        save(): void {
            this.succes[8] = (this.NB_secret !== 0);
            Bfile_DeleteFile(this.filenameSucces);
            Bfile_CreateFile(this.filenameSucces, 4 * NB_SUCCES);
            this.handle = Bfile_OpenFile(this.filenameSucces, _OPENMODE_WRITE);
            Bfile_WriteFile(this.handle, this.succes, 4 * NB_SUCCES);
            Bfile_CloseFile(this.handle);
        }

        afficherTrophee(resultat: number[]): void {
            let total: number = 0;
            if (resultat[0] > 1500) this.trophee[0] = true;
            if (resultat[1] > 1500) this.trophee[1] = true;
            if (resultat[2] > 1500) this.trophee[2] = true;
            if (resultat[3] > 1500) this.trophee[3] = true;
            if (resultat[4] > 1500) this.trophee[4] = true;
            if (resultat[5] > 1500) this.trophee[5] = true;

            if (resultat[0] > BEST_F) this.trophee[6] = true;
            if (resultat[1] > BEST_E) this.trophee[7] = true;
            if (resultat[2] > BEST_C) this.trophee[8] = true;
            if (resultat[3] > BEST_F_E) this.trophee[9] = true;
            if (resultat[4] > BEST_C_F) this.trophee[10] = true;
            if (resultat[5] > BEST_ALL) this.trophee[11] = true;

            for (let a: number = 0; a < 6; a++)total += resultat[a];

            if (total > 4200) this.trophee[12] = true;
            if (total > 6660) this.trophee[13] = true;
            if (total > 9000) this.trophee[14] = true;

            if (total > 10000 && resultat[5] > 1500) this.trophee[15] = true;

            PrintMini(47, 1, "trophees", 1);
            ML_rectangle(-1, -1, 26, 6, 1, ML_BLACK, ML_WHITE);
            PrintMini(1, 0, "retour", 1);
            for (let a: number = 0; a < 8; a++) {
                if (this.trophee[a]) ML_bmp_or(this.coupe, a * 16 + 1, 8, 13, 16);
                else ML_bmp_or(this.coupeNoire, a * 16 + 1, 8, 13, 16);
            }
            for (let a: number = 8; a < 16; a++) {
                if (this.trophee[a]) ML_bmp_or(this.coupe, (a - 8) * 16 + 1, 25, 13, 16);
                else ML_bmp_or(this.coupeNoire, (a - 8) * 16 + 1, 25, 13, 16);
            }
        }

        ecrireTrophee(X: number, Y: number): void {
            if (X < 14 && Y > 8 && Y < 24) { PrintMini(20, 44, "catch me if you can", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau following", 1); }

            if (X > 17 && X < 30 && Y > 8 && Y < 24) { PrintMini(20, 44, "je suis comme l'eau", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau compressing", 1); }

            if (X > 33 && X < 46 && Y > 8 && Y < 24) { PrintMini(1, 44, "terrorist,terrorist everywhere", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau exploding", 1); }

            if (X > 49 && X < 62 && Y > 8 && Y < 24) { PrintMini(20, 44, "a 2 c'est mieux", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau e + f", 1); }

            if (X > 65 && X < 78 && Y > 8 && Y < 24) { PrintMini(20, 44, "a deux c'est facile", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau f + c", 1); }

            if (X > 81 && X < 94 && Y > 8 && Y < 24) { PrintMini(20, 44, "expert du plan a trois", 1); PrintMini(1, 52, "obtenir une medaille d'or", 1); PrintMini(1, 58, "dans le niveau final boss", 1); }

            if (X > 97 && X < 110 && Y > 8 && Y < 24) { PrintMini(20, 44, "le developpeur est nul", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau following (1563)", 1); }

            if (X > 112 && Y > 8 && Y < 24) { PrintMini(20, 44, "die hard 4 etait plus facile", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau exploding (1720)", 1); }

            if (X < 14 && Y > 25 && Y < 40) { PrintMini(20, 44, "il est dur ce jeu !", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau compressing(1667)", 1); }

            if (X > 17 && X < 30 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8, which is redundant for this block
            { PrintMini(20, 44, "je ne suis pas multi-core", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau e + f (1690)", 1); }

            if (X > 33 && X < 46 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8
            { PrintMini(20, 44, "this isn't my final form", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau f + c (2105)", 1); }

            if (X > 49 && X < 62 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8
            { PrintMini(1, 44, "laisse mes scores tranquilles !", 1); PrintMini(1, 52, "faire mieux que le developpeur", 1); PrintMini(1, 58, "dans le niveau final (1545)", 1); }

            if (X > 65 && X < 78 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8
            { PrintMini(1, 44, "La Grande Question sur la vie", 1); PrintMini(1, 52, "obtenir 4200 en score total", 1);/*PrintMini(1,58,"dans le niveau final boss",1);*/ }

            if (X > 81 && X < 94 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8
            { PrintMini(20, 44, "tu es demoniaque !", 1); PrintMini(1, 52, "obtenir 6660 en score total", 1); }

            if (X > 97 && X < 110 && Y > 25 && Y < 40) // Corrected: Original C++ had Y > 8
            { PrintMini(1, 44, "it's over 9000 !", 1); PrintMini(1, 52, "obtenir 9000 en score total", 1); }

            if (X > 112 && Y > 25 && Y < 40) { PrintMini(1, 44, "ce n'est pas fini !", 1); PrintMini(1, 52, "debloquer le mode bonus", 1); }
        }

        afficherSucces(): void {
            let finish: number = 1;
            for (let a: number = 0; a < 16; a++) {
                if (!this.trophee[a]) finish = 0;
            }
            for (let a: number = 0; a < 8; a++) {
                if (!this.succes[a] && a != 5) finish = 0;
            }
            this.succes[5] = (finish !== 0);
            ML_rectangle(-1, -1, 26, 6, 1, ML_BLACK, ML_WHITE);
            PrintMini(1, 0, "retour", 1);
            PrintMini(50, 3, "succes", 1);
            for (let a: number = 0; a < 8; a++) {
                if (this.succes[a]) ML_bmp_or(this.coupe, a * 16 + 1, 15, 13, 16);
                else ML_bmp_or(this.coupeNoire, a * 16 + 1, 15, 13, 16);
            }
        }

        ecrireSucces(X: number, Y: number): void {
            if (X < 14 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "dur de choisir", 1);
                if (this.succes[0]) { PrintMini(1, 52, "rester 30 secondes sur l'ecran", 1); PrintMini(1, 58, " de selection de jeu", 1); }
            }

            if (X > 17 && X < 30 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "AFK", 1);
                if (this.succes[1]) { PrintMini(1, 52, "rester 2 minutes sans input", 1); }
            }

            if (X > 33 && X < 46 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "42", 1);
                if (this.succes[2]) { PrintMini(1, 52, "taper la reponse a la question", 1); PrintMini(1, 58, "dans l'ecran titre", 1); }
            }

            if (X > 49 && X < 62 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "touche a tout", 1);
                if (this.succes[3]) { PrintMini(1, 52, "trouver tous les secrets", 1); PrintMini(1, 58, "du jeu", 1); }
            }

            if (X > 65 && X < 78 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "goldfinger", 1);
                if (this.succes[4]) PrintMini(1, 52, "obtenir toute les medailles d'or", 1); PrintMini(1, 513, "des jeux de base", 1);
            } // Original Y-coordinate 513 kept

            if (X > 81 && X < 94 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "va t'acheter une vie !", 1);
                if (this.succes[5]) PrintMini(1, 52, "finir le jeu a 100%", 1);
            }

            if (X > 97 && X < 110 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "preuve de bon gout", 1);
                if (this.succes[6]) PrintMini(1, 52, "jouer a un jeu de dodormeur", 1);
            }

            if (X > 112 && Y > 13 && Y < 31) {
                PrintMini(20, 44, "je connais le developpeur !", 1);
                if (this.succes[7]) { PrintMini(1, 52, "introduire le code secret", 1); PrintMini(1, 58, "dans l'ecran titre", 1); }
            }
        }

        success(wich: number): void {
            this.succes[wich] = true;
        }

        secret(wich: number): void {
            if (wich > this.NB_secret) this.NB_secret++;
        }

        getSecret(): number {
            return this.NB_secret;
        }

        // private:
        private trophee: boolean[];
        private succes: boolean[];
        private filenameTrophee: string;
        private filenameSucces: string;
        private coupe: number[];
        private coupeNoire: number[];
        private handle: number;
        private NB_secret: number;
    };

    // Faithful C-style PrintV
    function PrintV(X: number, Y: number, variable: number): void {
        let i: number; // Unused in this TS version but kept for C++ structural similarity
        let length_of_str: number = 0; // Equivalent to C's `length` for string construction
        let str_arr: string[] = new Array(12);

        if (variable === 0) {
            str_arr[0] = '0';
            length_of_str = 1;
        } else {
            let current_pos_in_arr = 0;
            let temp_variable = variable;

            if (temp_variable < 0) {
                str_arr[current_pos_in_arr++] = '-';
                temp_variable = -temp_variable;
            }

            let num_digits = 0;
            if (temp_variable === 0) {
                num_digits = 1;
            } else {
                let n_val = temp_variable;
                while (n_val > 0) {
                    n_val = Math.trunc(n_val / 10);
                    num_digits++;
                }
            }

            length_of_str = current_pos_in_arr + num_digits;

            let n_fill = temp_variable;
            // Fill digits into str_arr from right to left for the number part
            // Example: num=123, current_pos_in_arr=0 (for positive), num_digits=3
            // k=0: str_arr[0+3-1-0] = str_arr[2] = '3'
            // k=1: str_arr[0+3-1-1] = str_arr[1] = '2'
            // k=2: str_arr[0+3-1-2] = str_arr[0] = '1'
            for (let k = 0; k < num_digits; k++) {
                str_arr[current_pos_in_arr + num_digits - 1 - k] = (n_fill % 10).toString();
                n_fill = Math.trunc(n_fill / 10);
            }
            if (temp_variable === 0 && current_pos_in_arr === 0) {
                str_arr[0] = '0';
            }
        }

        let s: string = "";
        for (let k_idx = 0; k_idx < length_of_str; ++k_idx) {
            s += str_arr[k_idx];
        }
        PrintMini(X, Y, s, 1);
    }

    // Faithful C-style PrintPour
    function PrintPour(X: number, Y: number, variable: number): void {
        // char str[12] = "0"; C default for variable = 0
        let str_arr: string[] = new Array(12);
        str_arr[0] = '0'; // TS equivalent default
        let final_print_length = 1;

        if (variable > 99) variable = 100;

        // C code: if(variable == 100)str[3]='%'; else if ... str[2]='%'; else if ... str[1]='%';
        // This part is tricky. It assumes specific indices based on *final* number of digits.
        // The C `if(variable)` block then fills the number.
        // This TS version builds the number part first, then appends '%'.

        if (variable === 0) {
            // Handled by default: str_arr[0] = '0', final_print_length = 1. No '%'
        } else {
            // Number part processing
            let num_part_length = 0;
            let n_val = variable; // Use a temporary for calculation
            if (n_val === 0) { // Technically, this case isn't hit if variable !== 0
                num_part_length = 1; // "0"
            } else {
                while (n_val > 0) {
                    n_val = Math.trunc(n_val / 10);
                    num_part_length++;
                }
            }

            // Fill number digits into str_arr from left to right
            n_val = variable; // Restore variable for digit extraction
            // Example: num=123, num_part_length=3
            // k=0 (rightmost digit '3'): str_arr[3-1-0] = str_arr[2] = '3'
            // k=1 (middle digit '2'):    str_arr[3-1-1] = str_arr[1] = '2'
            // k=2 (leftmost digit '1'):  str_arr[3-1-2] = str_arr[0] = '1'
            for (let k = 0; k < num_part_length; k++) {
                str_arr[num_part_length - 1 - k] = (n_val % 10).toString();
                n_val = Math.trunc(n_val / 10);
            }

            // Place '%' sign right after the number part
            str_arr[num_part_length] = '%';
            final_print_length = num_part_length + 1;
        }

        let s: string = "";
        for (let k_idx = 0; k_idx < final_print_length; ++k_idx) {
            s += str_arr[k_idx]; // Concatenate characters from the array
        }
        PrintMini(X, Y, s, 1);
    }


    function absX(nombre: number): number {
        // if(nombre < 128)return abs(nombre-128);
        // return nombre-128;
        return Math.abs(nombre - 128);
    }
    function absY(nombre: number): number {
        // if(nombre < 64)return abs(nombre-64);
        // return nombre-64;
        return Math.abs(nombre - 64);
    }

    class Wall {
        // public:
        constructor() {
            this.positionX = new Array(10);
            this.positionTrou = new Array(10);
            this.nombre = -1;
        }

        affichage(): void {
            for (let a: number = 0; a < this.nombre; a++) {
                ML_rectangle(this.positionX[a], 0, this.positionX[a] + 2, this.positionTrou[a], 0, ML_BLACK, ML_BLACK);
                ML_rectangle(this.positionX[a], 64, this.positionX[a] + 2, this.positionTrou[a] + 17, 0, ML_BLACK, ML_BLACK);
            }
        }

        nouveauMenu(): void {
            this.nombre++;
            this.positionX[this.nombre] = 130;
            this.positionTrou[this.nombre] = rand() % 47;
        }

        nouveau(): void {
            this.nombre++;
            this.positionX[this.nombre] = 110;
            this.positionTrou[this.nombre] = rand() % 47;
        }

        free(): void {
            for (let a: number = 0; a < this.nombre; a++) // Iterate up to current 'nombre'
            {
                if (this.positionX[a] < -1) {
                    this.nombre--; // Decrement count first
                    for (let b: number = a; b <= this.nombre; b++) // Shift elements. b goes up to the new 'nombre'
                    {
                        this.positionX[b] = this.positionX[b + 1];
                        this.positionTrou[b] = this.positionTrou[b + 1];
                    }
                    // After shifting, the element at 'a' is effectively removed.
                    // The loop should re-evaluate the new element at 'a', so decrement 'a'.
                    a--; // So that the next iteration checks the element that was shifted into current 'a'
                }
            }
        }

        deplacement(): void {
            for (let a: number = 0; a < this.nombre; a++) {
                this.positionX[a] -= 2;
                //if(positionX[a] < 0){free();nouveau();}
            }
        }

        collision(X: number, Y: number): boolean {
            let retour: number = 0;
            for (let a: number = 0; a < this.nombre; a++) {
                // Original C++: if((positionX[a] > X+2)||(positionX[a]+3 < X)); else if(Y-1<=positionTrou[a] || Y+2>positionTrou[a]+17)retour = 1;
                // This structure means: if the first condition (no horizontal overlap) is true, do nothing (due to ';').
                // Otherwise (else), check the vertical collision.
                if ((this.positionX[a] > X + 2) || (this.positionX[a] + 3 < X)) { /* do nothing */ }
                else if (Y - 1 <= this.positionTrou[a] || Y + 2 > this.positionTrou[a] + 17) retour = 1;
            }
            return retour !== 0;
        }

        // private:
        private positionX: number[];
        private positionTrou: number[];
        private nombre: number;
    };

    // Assuming definitions for:
    // jeu, Heros, score, Follower, Wall, Bomb, Trophee (already translated)
    // TITRE, CHOIX_JEU, CHOIX_BONUS, TROPHEE, SUCCES, CREDIT, INVADERS, MUR, FIN_SECRET, TUTO (enum-like constants)
    // COMPRESSOR, FOLLOWER, EXPLODING, C_F, F_E, FINAL_BOSS (enum-like constants for game types)
    // PrintMini, PrintXY, PrintV, PrintPour (already translated or external)
    // ML_rectangle, ML_display_vram, ML_clear_vram, ML_set_contrast
    // time_getTicks, srand
    // loadOption, saveOption
    // K_EXE, K_UP, K_DOWN, K_LEFT, K_RIGHT, K_4, K_2, K_SIN, K_9, K_6, K_7, K_COS, K_1 (key constants)
    // key_down (function)
    // Rectangle (async function, already translated)
    // GetKey, Sleep (async functions, to be used with await)

    // Simulating enum values for screen states and game types
    const TITRE = 1
    const CHOIX_JEU = 2
    const TROPHEE = 3
    const SUCCES = 4
    const CREDIT = 5
    const INVADERS = 6
    const MUR = 7
    const FIN_SECRET = 8
    const CHOIX_BONUS = 9
    const TUTO = 10

    const FOLLOWER = 0;
    const COMPRESSOR = 1; // Example value for game type index
    const EXPLODING = 2;
    const C_F = 3; // Compressor + Follower
    const F_E = 4; // Follower + Exploding
    const FINAL_BOSS = 5; // All three


    async function main(): Promise<number> // C++ main returns int
    {

        //initialisation
        let partie: jeu = new jeu();
        let heros: Heros = new Heros();
        let point: score = new score();
        let resultat: number;
        let contraste: number = 170;
        let x: number, y: number, ecran: number = TITRE;
        let follower: Follower = new Follower();
        let wall: Wall = new Wall();
        let bomb: Bomb = new Bomb();
        let trophee: Trophee = new Trophee();
        let frame: number = 10;
        let vitesse: number = 36; // Lower is faster for modulo operations
        let temps: number = 0;
        let four: number = 0; // Flags for key sequence
        let two: number = 0;  // Not used in the C++ code provided for this logic, but declared.
        let fin: number = 0; // Game loop exit flag
        let code: number = 0; // For secret code input
        let AFK: number = 0; // AFK timer for achievements
        let attente: number = 0; // Timer for specific screen interactions
        let key: number; // Represents the key pressed, if GetKey were used directly. (Currently unused)

        //cree un mur pour le menu
        wall.nouveauMenu();
        wall.nouveauMenu();

        //charge le score
        point.loadScore();

        trophee.load();

        //teste si le joueur a deja jouer a un bon jeu
        trophee.tester();

        while (fin === 0) // C++: while(!fin)
        {
            AFK++; //pour voir si il reste 30 sec ou 2 minutes pour les succes
            resultat = point.getScoreTotal();
            x = heros.getX() + 1;
            y = heros.getY() + 1;

            /*affichage des menus*/
            if (ecran == TITRE) {
                PrintMini(50, 25, "jouer", 1);
                PrintMini(45, 38, "trophees", 1);
                PrintMini(50, 51, "succes", 1);
                PrintXY(16, 10, "evasion survival", 0);
                PrintMini(1, 58, "quitter", 1);
                ML_rectangle(-1, 56, 27, 68, 1, ML_BLACK, ML_TRANSPARENT);
            }
            //affichage des previsualisation des niveaux
            if (ecran == CHOIX_JEU || ecran == CHOIX_BONUS) {
                attente++;
                ML_rectangle(0, 1, 46, 9, 1, ML_BLACK, ML_WHITE);
                if (resultat < 500) ML_rectangle(1, 2, 46 - (Math.trunc(46 * resultat / 500)), 9, 0, ML_BLACK, ML_BLACK);
                else {
                    PrintMini(3, 11, "score:", 1);
                    PrintV(27, 11, point.getScoreGame(COMPRESSOR));
                    point.medailleScore(point.getScoreGame(COMPRESSOR), 24, 20);
                }
                PrintMini(2, 3, "compressor", 1);

                ML_rectangle(48, 1, 85, 9, 1, ML_BLACK, ML_WHITE);
                PrintMini(50, 3, "follower", 1);
                PrintMini(47, 11, "score:", 1);
                PrintV(71, 11, point.getScoreGame(FOLLOWER));
                point.medailleScore(point.getScoreGame(FOLLOWER), 63, 20);

                ML_rectangle(87, 1, 124, 9, 1, ML_BLACK, ML_WHITE);
                if (resultat < 1500) ML_rectangle(87, 2, 124 - (Math.trunc(37 * resultat / 1500)), 9, 0, ML_BLACK, ML_BLACK);
                else {
                    PrintMini(87, 11, "score:", 1);
                    PrintV(111, 11, point.getScoreGame(EXPLODING));
                    point.medailleScore(point.getScoreGame(EXPLODING), 100, 20);
                }
                PrintMini(89, 3, "exploding", 1);


                ML_rectangle(33, 18, 55, 26, 1, ML_BLACK, ML_WHITE);
                if (resultat < 3000) ML_rectangle(33, 18, 55 - (Math.trunc(22 * resultat / 3000)), 26, 0, ML_BLACK, ML_BLACK);
                else {
                    PrintMini(24, 28, "score:", 1);
                    PrintV(48, 28, point.getScoreGame(C_F));
                    point.medailleScore(point.getScoreGame(C_F), 38, 37);
                }
                PrintMini(35, 20, "c + f", 1);

                ML_rectangle(70, 18, 92, 26, 1, ML_BLACK, ML_WHITE);
                if (resultat < 5000) ML_rectangle(70, 18, 92 - (Math.trunc(22 * resultat / 5000)), 26, 0, ML_BLACK, ML_BLACK);
                else {
                    PrintMini(66, 28, "score:", 1);
                    PrintV(90, 28, point.getScoreGame(F_E));
                    point.medailleScore(point.getScoreGame(F_E), 90, 37);
                }
                PrintMini(72, 20, "f + e", 1);

                ML_rectangle(43, 34, 84, 42, 1, ML_BLACK, ML_WHITE);
                if (resultat < 7500) ML_rectangle(43, 34, 84 - (Math.trunc(41 * resultat / 7500)), 42, 0, ML_BLACK, ML_BLACK);
                else {
                    PrintMini(45, 44, "score:", 1);
                    PrintV(69, 44, point.getScoreGame(FINAL_BOSS));
                    point.medailleScore(point.getScoreGame(FINAL_BOSS), 64, 53);
                }
                PrintMini(45, 36, "final boss", 1);

                PrintMini(30, 58, "score total:", 1);
                PrintV(79, 58, resultat);
                ML_rectangle(-1, 57, 26, 65, 1, ML_BLACK, ML_WHITE);
                PrintMini(1, 59, "retour", 1);
                if (ecran == CHOIX_JEU && point.getScoreTotal() > 10000 && point.getScoreGame(5) > 1500) {
                    PrintMini(107, 58, "bonus", 1);
                    ML_rectangle(105, 56, 129, 65, 1, ML_BLACK, ML_TRANSPARENT);
                }

                if ((y < 9 && x > 47 && x < 85) || (x > 33 && y > 18 && x < 55 && y < 26 && resultat > 3000) || (x > 70 && y > 18 && x < 92 && y < 26 && resultat > 5000) || (x > 43 && y > 34 && x < 84 && y < 44 && resultat > 7500)) {
                    if (!(frame % vitesse)) { follower.free(); follower.nouveau(heros.getX(), heros.getY()); }
                    follower.deplacement();
                }

                if (((y < 9 && x < 46) && resultat > 500) || (x > 33 && y > 18 && x < 55 && y < 26 && resultat > 3000) || (x > 43 && y > 34 && x < 84 && y < 44 && resultat > 7500)) {
                    if ((!(frame % Math.trunc(vitesse / 4)))) { temps++; wall.deplacement(); } // C++ integer division
                    if ((temps == 14)) { wall.free(); wall.nouveauMenu(); temps = 0; }
                    wall.affichage();
                }

                if ((y < 9 && x > 86 && resultat > 1500) || (x > 70 && y > 18 && x < 92 && y < 26 && resultat > 5000) || (x > 43 && y > 34 && x < 84 && y < 44 && resultat > 7500)) {
                    if (!(frame % vitesse)) { bomb.free(); bomb.nouveau(); }
                    bomb.deplacement();
                    bomb.affichage();
                }

            }

            if (ecran == TROPHEE) {
                trophee.afficherTrophee(point.getTableau());
                trophee.ecrireTrophee(x, y);
            }
            if (ecran == SUCCES) {
                point.setType(0);
                if (point.getScoreGame(5) > 1499 && point.getScoreGame(4) > 1499 && point.getScoreGame(3) > 1499 && point.getScoreGame(2) > 1499 && point.getScoreGame(1) > 1499 && point.getScoreGame(1) > 1499) trophee.success(4);
                trophee.afficherSucces();
                trophee.ecrireSucces(x, y);
            }

            if (ecran == CREDIT) {
                PrintXY(10, 0, "credits", 0);
                PrintMini(1, 15, "createur : dodormeur", 1);
                PrintMini(1, 25, "bravo, vous avez decouvert le", 1);
                PrintMini(1, 31, "premier secret !", 1);
                PrintMini(1, 37, "indice : le suivant se trouve", 1);
                PrintMini(1, 43, "dans un niveau", 1);
                trophee.secret(1);
                ML_rectangle(-1, 57, 26, 65, 1, ML_BLACK, ML_WHITE);
                PrintMini(1, 59, "retour", 1);
            }

            if (ecran == INVADERS) {
                PrintMini(1, 0, "bravo, vous avez secouru", 1);
                PrintMini(1, 6, "le pauvre space invaders", 1);
                PrintMini(1, 12, "qui s'etait perdu !", 1);
                PrintMini(1, 20, "vous avez trouve le deuxieme", 1);
                PrintMini(1, 26, "secret !", 1);
                PrintMini(1, 35, "indice : tous les murs ne", 1);
                PrintMini(1, 41, "compressent pas...", 1);
                trophee.secret(2);
                ML_rectangle(-1, 57, 26, 65, 1, ML_BLACK, ML_WHITE);
                PrintMini(1, 59, "retour", 1);
            }

            if (ecran == MUR) {
                PrintMini(1, 0, "bravo, vous avez trouve", 1);
                PrintMini(1, 6, "la cachette du troisieme", 1);
                PrintMini(1, 12, "secret !", 1);
                PrintMini(1, 20, "maintenant, allez chercher", 1);
                PrintMini(1, 26, "votre recompense !", 1);
                PrintMini(1, 35, "indice : j'aime les enfants", 1);
                trophee.secret(3);
                ML_rectangle(-1, 57, 26, 65, 1, ML_BLACK, ML_WHITE);
                PrintMini(1, 59, "retour", 1);
            }

            if (ecran == FIN_SECRET) {
                PrintMini(1, 0, "bravo, vous avez trouve", 1);
                PrintMini(1, 6, "tous les secrets !", 1);
                PrintMini(1, 20, "vous avez deverouille", 1);
                PrintMini(1, 26, "le succes touche a tout", 1);
                PrintMini(1, 35, "indice : j'aime les enfants", 1);
                PrintMini(1, 41, "avec de la mayonnaise", 1);
                trophee.secret(4);
                trophee.success(3);
                ML_rectangle(-1, 57, 26, 65, 1, ML_BLACK, ML_WHITE);
                PrintMini(1, 59, "retour", 1);
            }

            //on ne prend les input qu'1 fois sur 2
            if (frame % 2) heros.input();
            heros.affichageMenu();
            ML_display_vram();


            await setFps(26);

            //gere les changement de menu
            if (key_down(K_EXE)) {
                let temporaire: number = ecran;

                if (ecran == TITRE) {
                    // unsigned int key; // This `key` is unused and shadows the outer scope `key`
                    if (x > 49 && x < 71 && y > 24 && y < 32) { ecran = CHOIX_JEU; point.setType(0); }
                    if (x > 44 && x < 76 && y > 37 && y < 45) ecran = TROPHEE;
                    if (x > 49 && x < 76 && y > 50 && y < 58) ecran = SUCCES;
                    if (x > 16 && x < 100 && y > 9 && y < 17) ecran = CREDIT; // Coordinates seem large for "evasion survival" text, check layout
                    if (y > 56 && x < 27) {
                        fin = 1;
                        await Rectangle(x, y);
                    }
                }
                if (ecran == TROPHEE) {
                    if (x < 30 && y < 8) ecran = TITRE;
                }

                if (ecran == SUCCES) {
                    if (x < 30 && y < 8) ecran = TITRE;
                    if(x >49 && x<62 && y >8 && y < 24)ecran = FIN_SECRET;
                }



                if (ecran == CHOIX_JEU) {
                    let resultat_local: number = point.getScoreTotal(); // Shadowing outer `resultat`
                    let secret_: number = trophee.getSecret();
                    let retour: number = 0;
                    if (y > 58 && x < 25) { if (attente > 780) trophee.success(0); attente = 0; ecran = TITRE; }
                    if (y < 9 && x < 46 && resultat_local > 500) { await Rectangle(x, y); retour = await partie.game(0, 0, 1, secret_, 0); }
                    if (y < 9 && x > 47 && x < 85) { await Rectangle(x, y); retour = await partie.game(1, 0, 0, secret_, 0); }
                    if (y < 9 && x > 86 && resultat_local > 1500) { await Rectangle(x, y); retour = await partie.game(0, 1, 0, secret_, 0); }
                    if (x > 33 && y > 18 && x < 55 && y < 26 && resultat_local > 3000) { await Rectangle(x, y); retour = await partie.game(1, 0, 1, secret_, 0); }
                    if (x > 70 && y > 18 && x < 92 && y < 26 && resultat_local > 5000) { await Rectangle(x, y); retour = await partie.game(1, 1, 0, secret_, 0); }
                    if (x > 43 && y > 34 && x < 84 && y < 44 && resultat_local > 7500) { await Rectangle(x, y); retour = await partie.game(1, 1, 1, secret_, 0); }
                    if (x > 104 && y > 56 && point.getScoreTotal() > 10000 && point.getScoreGame(5) > 1500) {
                        ecran = CHOIX_BONUS;
                        point.setType(1);
                    }
                    point.loadScore();
                    if (retour == 1) ecran = INVADERS;
                    if (retour == 2) ecran = MUR;
                }
                if (ecran == CHOIX_BONUS) {
                    let secret_: number = trophee.getSecret();
                    let resultat_local: number = point.getScoreTotal(); // Shadowing outer `resultat`
                    if (y > 58 && x < 25) { if (attente > 780) trophee.success(0); attente = 0; ecran = CHOIX_JEU; point.setType(0); }
                    if (y < 9 && x < 46 && resultat_local > 500) { await Rectangle(x, y); await partie.game(0, 0, 1, secret_, 1); }
                    if (y < 9 && x > 47 && x < 85) { await Rectangle(x, y); await partie.game(1, 0, 0, secret_, 1); }
                    if (y < 9 && x > 86 && resultat_local > 1500) { await Rectangle(x, y); await partie.game(0, 1, 0, secret_, 1); }
                    if (x > 33 && y > 18 && x < 55 && y < 26 && resultat_local > 3000) { await Rectangle(x, y); await partie.game(1, 0, 1, secret_, 1); }
                    if (x > 70 && y > 18 && x < 92 && y < 26 && resultat_local > 5000) { await Rectangle(x, y); await partie.game(1, 1, 0, secret_, 1); }
                    if (x > 43 && y > 34 && x < 84 && y < 44 && resultat_local > 7500) { await Rectangle(x, y); await partie.game(1, 1, 1, secret_, 1); }
                    point.loadScore();
                }
                if (ecran == CREDIT) {
                    if (y > 58 && x < 25) ecran = TITRE;
                }
                if (ecran == INVADERS) {
                    if (y > 58 && x < 25) ecran = TITRE;
                }
                if (ecran == MUR) {
                    if (y > 58 && x < 25) ecran = TITRE;
                }
                if (ecran == FIN_SECRET) {
                    if (y > 58 && x < 25) ecran = TITRE;
                }

                if (ecran == TUTO) {
                    if (x > 89 && y > 56) { ecran = TITRE; }
                }
                if (ecran != temporaire) await Rectangle(x, y);
                while (key_down(K_EXE)) {await Sleep(10);}; // Wait for key release
            }
            ML_clear_vram();
            frame++;
            if (!key_down(K_EXE) && !key_down(K_UP) && !key_down(K_DOWN) && !key_down(K_LEFT) && !key_down(K_RIGHT)) AFK++;
            else AFK = 0; // toujours pour les succes
            if (AFK == 2880) trophee.success(1);
        }
        //sauvegarde les succes
        trophee.save();

        return 1;
    }

    async function AddIn_main() {
        await main();
    }

    return {AddIn_main}

}
