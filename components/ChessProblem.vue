<template>
    <div class="chessproblem">
        <div class="wrapper">
            <div class="disable-overlay" v-if="isBoardDisabled"></div>
            <TheChessboard :board-config="boardConfig" @board-created="onBoardCreated" @move="onMove" />
        </div>
        <figcaption v-if="caption">
            <template v-if="nbMovesMade === moves.length"><span class="success-icon">✓</span> Success!</template>
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
}

.main-wrap, .wrapper {
    width: min(100%, 10cm);
    max-width: 10cm;
}

.success-icon {
    color: hsl(88, 62%, 50%);
}

.failure-icon {
    color: hsl(0, 80%, 50%);
}
</style>
<style>
cg-board square.move-dest {
    background: radial-gradient(rgba(20, 85, 30, .5) 22%, rgba(20, 85, 30, 0) calc(22% + 1px));
}
cg-board square.oc.move-dest {
    background: radial-gradient(transparent 0%,rgba(20,85,0,0) calc(80% - 1px),rgba(20,85,0,.3) 80%);
}
cg-container .cg-custom-svgs svg {
    overflow: visible;
}
cg-board {
    /* background-image: url("https://lichess1.org/assets/hashed/metal.d475ecaa.jpg"); */
    background-image: url("/public/chessboard_blue.jpg");
}
</style>

<script setup>
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
    moves: {
        type: Array,
        required: true,
    },
});

const { fen } = toRefs(props);

const moves = props.moves.split(" ").map(x => x.replace("+", ""));

let boardApi;
const nbMovesMade = ref(0);
const isWrongMove = ref(false);
const isBoardDisabled = ref(false);

//https://github.com/lichess-org/lila/blob/master/ui/lib/src/game/glyphs.ts
const goodMoveShape = '<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs><g transform="translate(71 -12) scale(0.4)"><circle style="fill:#22ac38;filter:url(#shadow)" cx="50" cy="50" r="50" /><path fill="#fff" d="M87 32.8q0 2-1.4 3.2L51 70.6 44.6 77q-1.7 1.3-3.4 1.3-1.8 0-3.1-1.3L14.3 53.3Q13 52 13 50q0-2 1.3-3.2l6.4-6.5Q22.4 39 24 39q1.9 0 3.2 1.3l14 14L72.7 23q1.3-1.3 3.2-1.3 1.6 0 3.3 1.3l6.4 6.5q1.3 1.4 1.3 3.4z"/></g>'
const badMoveShape = '<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs><g transform="translate(71 -12) scale(0.4)"><circle style="fill:#df5353;filter:url(#shadow)" cx="50" cy="50" r="50" /><path fill="#fff" d="M79.4 68q0 1.8-1.4 3.2l-6.7 6.7q-1.4 1.4-3.5 1.4-1.9 0-3.3-1.4L50 63.4 35.5 78q-1.4 1.4-3.3 1.4-2 0-3.5-1.4L22 71.2q-1.4-1.4-1.4-3.3 0-1.7 1.4-3.5L36.5 50 22 35.4Q20.6 34 20.6 32q0-1.7 1.4-3.5l6.7-6.5q1.2-1.4 3.5-1.4 2 0 3.3 1.4L50 36.6 64.5 22q1.2-1.4 3.3-1.4 2.3 0 3.5 1.4l6.7 6.5q1.4 1.8 1.4 3.5 0 2-1.4 3.3L63.5 49.9 78 64.4q1.4 1.8 1.4 3.5z"/></g>'

const displayedCaption = computed(() => {
    return props.caption.replace("%moves%", Math.ceil((moves.length - nbMovesMade.value)/2));
})

const boardConfig = {
    fen: fen.value,
    coordinates: false,
    animation: {
        duration: 300,
    },
    drawable: {
        enabled: true,
        visible: true,
        shapes: [
            {orig: "a1", dest: "a2", customSvg: {html: goodMoveShape, center: "dest"}},
            {orig: "a1", dest: "a3", customSvg: {html: badMoveShape, center: "dest"}}
        ],
    },
}

function onBoardCreated(boardApi_) {
    boardApi = boardApi_;
}

async function onMove(move) {
    // Handle the move event
    console.log('Move made:', move);
    console.log("board = ", boardApi);
    if (nbMovesMade.value % 2 === 0) {
        if (moves[nbMovesMade.value] !== move.san.replace("+", "")) {
            // Invalid move
            console.log("Invalid move");
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
            boardApi.setShapes([{orig: move.from, dest: move.to, customSvg: {html: goodMoveShape, center: "dest"}}]);
            nbMovesMade.value++;
            await new Promise(resolve => setTimeout(resolve, 500));
            if (nbMovesMade.value < moves.length) {
                boardApi.setShapes([]);
                boardApi.move(moves[nbMovesMade.value]);
            }
        }
    } else {
        isBoardDisabled.value = false;
        nbMovesMade.value++;
    }
}

</script>
