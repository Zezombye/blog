<template>
    <div class="chessproblem">
        <div class="wrapper">
            <div class="disable-overlay" v-if="isBoardDisabled"></div>
            <TheChessboard :board-config="boardConfig" @board-created="onBoardCreated" @move="onMove" @checkmate="onCheckmate" />
        </div>
        <figcaption v-if="caption || captions.length > 0">
            <template v-if="captions.length > 0"><span v-if="nbMovesMade === moves.length" class="success-icon">✓ </span>{{ captions[nbMovesMade === moves.length ? Math.ceil(moves.length/2) : Math.max(0, Math.floor(nbMovesMade/2))] }}</template>
            <template v-else-if="nbMovesMade === moves.length"><span class="success-icon">✓</span> Success!</template>
            <!-- <template v-else-if="isWrongMove"><span class="failure-icon">✗</span> Wrong move!</template> -->
            <template v-else>{{ displayedCaption }}</template>
        </figcaption>
    </div>
</template>

<style scoped>

.chessproblem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.wrapper {
    position: relative;
}

.disable-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /*background-color: rgba(255, 255, 255, 0.5);*/
    z-index: 9999;
    cursor: pointer;
    aspect-ratio: 1/1;
}

figcaption {
    text-align: center;
    font-style: italic;
    margin-top: 0.5em;
    font-size: 15px;
    white-space: pre-wrap;
}

.main-wrap, .wrapper {
    width: min(100%, 12cm);
    max-width: 12cm;
}

.success-icon {
    color: hsl(88, 62%, 50%);
    padding-right: 0.2em;
}

.failure-icon {
    color: hsl(0, 80%, 50%);
}
</style>
<style>
cg-board square.move-dest {
    background: radial-gradient(rgba(20, 85, 30, .5) calc(19% - 0.5px), rgba(20, 85, 30, 0) calc(19% + 0.5px));
}
cg-board square.oc.move-dest {
    background: radial-gradient(transparent 0%,rgba(20,85,0,0) calc(80% - 0.5px),rgba(20,85,0,.3) calc(80% + 0.5px));
}
cg-container .cg-custom-svgs svg {
    overflow: visible;
}
cg-board {
    /* background-image: url("https://lichess1.org/assets/hashed/metal.d475ecaa.jpg"); */
    background-image: url("/chessboard_blue.jpg");
}
</style>

<script setup>

//https://qwerty084.github.io/vue3-chessboard-docs/
//https://github.com/qwerty084/vue3-chessboard

import { ref, toRefs, computed } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const props = defineProps({
    fen: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        default: '',
    },
    captions: {
        type: Array,
        default: [],
    },
    moves: {
        type: String,
        required: true,
    },
    orientation: {
        type: String,
        default: 'white',
    },
    arrows: {
        type: Array,
        default: [],
    },
    displaySuccessIcon: {
        type: Boolean,
        default: true,
    },
    displayCheckmateIcon: {
        type: Boolean,
        default: true,
    },
});

const { fen, orientation, arrows } = toRefs(props);

const moves = props.moves.split(" ").map(x => x.replace("+", ""));

let boardApi;
const nbMovesMade = ref(0);
const isWrongMove = ref(false);
const isBoardDisabled = ref(moves.length === 1 && moves[0] === "");

//https://github.com/lichess-org/lila/blob/master/ui/lib/src/game/glyphs.ts
const goodMoveShape = '<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs><g transform="translate(71 -12) scale(0.4)"><circle style="fill:#22ac38;filter:url(#shadow)" cx="50" cy="50" r="50" /><path fill="#fff" d="M87 32.8q0 2-1.4 3.2L51 70.6 44.6 77q-1.7 1.3-3.4 1.3-1.8 0-3.1-1.3L14.3 53.3Q13 52 13 50q0-2 1.3-3.2l6.4-6.5Q22.4 39 24 39q1.9 0 3.2 1.3l14 14L72.7 23q1.3-1.3 3.2-1.3 1.6 0 3.3 1.3l6.4 6.5q1.3 1.4 1.3 3.4z"/></g>'
const badMoveShape = '<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs><g transform="translate(71 -12) scale(0.4)"><circle style="fill:#df5353;filter:url(#shadow)" cx="50" cy="50" r="50" /><path fill="#fff" d="M79.4 68q0 1.8-1.4 3.2l-6.7 6.7q-1.4 1.4-3.5 1.4-1.9 0-3.3-1.4L50 63.4 35.5 78q-1.4 1.4-3.3 1.4-2 0-3.5-1.4L22 71.2q-1.4-1.4-1.4-3.3 0-1.7 1.4-3.5L36.5 50 22 35.4Q20.6 34 20.6 32q0-1.7 1.4-3.5l6.7-6.5q1.2-1.4 3.5-1.4 2 0 3.3 1.4L50 36.6 64.5 22q1.2-1.4 3.3-1.4 2.3 0 3.5 1.4l6.7 6.5q1.4 1.8 1.4 3.5 0 2-1.4 3.3L63.5 49.9 78 64.4q1.4 1.8 1.4 3.5z"/></g>'
const checkmateShape = '<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs><g transform="translate(71 -12) scale(0.4)"><circle style="fill:#ec4040;filter:url(#shadow)" cx="50" cy="50" r="50" /><circle cx="50" cy="50" r="25" fill="none" stroke="#fff" stroke-width="7"/><path fill="none" stroke="#fff" stroke-width="7" d="M50 25v50M25 50h50"/></g>'

const displayedCaption = computed(() => {
    return props.caption.replace("%moves%", Math.ceil((moves.length - nbMovesMade.value+1)/2));
})

const boardConfig = {
    fen: fen.value,
    coordinates: false,
    orientation: orientation.value,
    animation: {
        duration: 300,
    },
    shapes: [{orig: "b8", dest: "b1", brush: "green"}], // Example shape, can be overridden by arrows prop
    autoShapes: [{orig: "b8", dest: "b1", brush: "green"}], // Example shape, can be overridden by arrows prop
}

function onBoardCreated(boardApi_) {
    boardApi = boardApi_;

    //green, red, blue, yellow, paleBlue, paleGreen, paleRed, paleGrey, purple, pink, hilite
    boardApi.setShapes(arrows.value.map(arrow => ({
        orig: arrow.from,
        dest: arrow.to,
        brush: arrow.color || "green" // Default color if not specified
    })));
    boardApi.board.redrawAll();
}

function normalizeMove(move) {
    // Normalize the move to a standard format
    return move.replace("+", "").replace("#", "");
}

function getCheckmatedKingCoords(kingColor) {
    // Find the coordinates of the king of the given color
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let coords = `${String.fromCharCode(97 + col)}${8 - row}`;
            const square = boardApi.getSquare(coords);
            if (square.type === "k" && square.color === kingColor[0]) {
                return coords;
            }
        }
    }
    return null;
}

async function onMove(move) {
    // Handle the move event
    //console.log('Move made:', move);
    //console.log("board = ", boardApi);
    if (nbMovesMade.value % 2 === 0) {
        if (normalizeMove(moves[nbMovesMade.value]) !== normalizeMove(move.san)) {
            // Invalid move
            //console.log("Invalid move");
            isWrongMove.value = true;
            boardApi.setShapes([{orig: move.from, dest: move.to, customSvg: {html: badMoveShape, center: "dest"}}]);
            await new Promise(resolve => setTimeout(resolve, 350));
            boardApi.setShapes([]);
            boardApi.undoLastMove();
            await new Promise(resolve => setTimeout(resolve, 350));
            isWrongMove.value = false;
        } else {
            // Valid move
            isBoardDisabled.value = true;
            let shapes = [];
            if (props.displaySuccessIcon) {
                shapes.push({orig: move.from, dest: move.to, customSvg: {html: goodMoveShape, center: "dest"}});
            }
            if (props.displayCheckmateIcon && boardApi.getIsCheckmate()) {
                let color = boardApi.getTurnColor();
                let kingCoords = getCheckmatedKingCoords(color);
                shapes.push({orig: kingCoords, dest: kingCoords, customSvg: {html: checkmateShape, center: "dest"}});
            }
            boardApi.setShapes(shapes);
            nbMovesMade.value++;
            await new Promise(resolve => setTimeout(resolve, 500));
            if (nbMovesMade.value < moves.length) {
                boardApi.setShapes([]);
                boardApi.move(moves[nbMovesMade.value]);
            }
        }
    } else {
        nbMovesMade.value++;
        if (nbMovesMade.value < moves.length) {
            isBoardDisabled.value = false;
        }
        if (props.displayCheckmateIcon && boardApi.getIsCheckmate()) {
            let color = boardApi.getTurnColor();
            let kingCoords = getCheckmatedKingCoords(color);
            boardApi.setShapes([{orig: kingCoords, dest: kingCoords, customSvg: {html: checkmateShape, center: "dest"}}]);
        }
    }
}

</script>
