<script setup>

import CalcEmulator from "../casio-emulator/CalcEmulator.vue"
import sokoban from "../casio-emulator/sokoban.js"

</script>

# Sokoban

<CalcEmulator :program="sokoban"/>

A good ol' sokoban I made in 2016, which was very handy during long math classes :D

You play as Pedro, a Mexican working at Amazon where he has to store large crates in designated spots. However, since the crates are heavy, **he cannot pull them** and must push them with all his strength. **He cannot push two crates at once.** Your goal is therefore to place the crates on their designated spots without blocking them in the corners.

Press `[EXE]` (Shift/Enter on PC) to restart the level, and `[EXIT]` (Space/Escape on PC) to change the level.

Level credits:

- Levels 1 & 2: E.J. Jiménez
- Levels 55, 64, 71, 74: [Gorn](http://www.planet-casio.com/Fr/programmes/programme120-last-soko-ban-gorn-a3.html)
- Other levels: Yoshio Murase & Erim Sever
