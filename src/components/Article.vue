<template>
    <article class="content whitespace-pre-line">
        <slot></slot>
    </article>
</template>

<script setup>

import { provide } from 'vue'

const props = defineProps({
    codeLang: {
        type: String,
    },
})

if (props.codeLang) {
    provide("codeLang", props.codeLang)
}

</script>
