<template>
    <div ref="slotContainer" v-show="false">
        <slot></slot>
    </div>
    <code v-html="slotContent"></code>
</template>

<script setup>

import { useSlots, ref, onMounted, computed } from 'vue'

const props = defineProps({
    lang: {
        type: String,
        default: 'javascript',
    },
})

const slotContainer = ref(null)
const slotContent = computed(() => {
    return slotContainer.value ? Prism.highlight(slotContainer.value.innerHTML, Prism.languages[props.lang], props.lang) : ''
})

</script>
