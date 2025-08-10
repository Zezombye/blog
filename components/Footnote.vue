<!-- Technically not a "footnote" as it is inline, however it is used in the same case of adding details which aren't necessary for the article. -->

<template>
    <span class="footnote" @click="isExpanded = !isExpanded" :class="{ 'expanded': isExpanded, 'bigger-font': biggerFont }" :title="!isExpanded ? (tooltipText || expandedText) : ''">
        <span v-if="!isExpanded">{{ unexpandedText }}</span>
        <span v-else v-html='expandedText'></span>
    </span>
</template>

<script>

import { fixTypography } from "../.vitepress/markdown-it-typographic-replacer.js";

export default {
    name: 'Footnote',
    props: {
        text: {
            type: String,
            required: true
        },
        unexpandedText: {
            type: String,
            default: '…'
        },
        tooltipText: {
            type: String,
            default: ''
        },
        addParentheses: {
            type: Boolean,
            default: true
        },
        biggerFont: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isExpanded: false
        }
    },
    computed: {
        // This is used to ensure that the text is always fixed, even if it is not expanded.
        expandedText() {
            return (this.addParentheses ? "(" : "")+fixTypography(this.text).trim()+(this.addParentheses ? ")" : "");
        }
    },
    methods: {fixTypography},
}
</script>

<style scoped>
.footnote {
    display: inline;
    background-color: var(--vp-code-bg);
    border: 1px solid var(--vp-code-bg);
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 13px;
}
.footnote.bigger-font {
    font-size: 14px;
}

html .footnote {
    color: #003068;
}
html.dark .footnote {
    color: #d2e7ff;
}

.footnote:not(.expanded) {

    cursor: pointer;
}

@media (hover: hover) {
    .footnote:not(.expanded):hover {
        filter: brightness(300%);
    }
}
</style>
