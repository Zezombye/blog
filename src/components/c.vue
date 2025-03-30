<!-- Code (inline or block) -->

<template>
    <code v-html="renderedCode" v-bind="$attrs" :lang="language"></code>
</template>

<script setup>

import { useSlots, ref, onMounted, computed, inject } from 'vue'

const props = defineProps({
    lang: {
        type: String,
        default: 'javascript',
    },
})

const language = inject("codeLang", props.lang)

const slots = useSlots()

const renderedCode = computed(() => {
    let content = slots.default()[0].children[0].children
    content = content.replace(/^\n+/g, '')
    content = content.replace(/\t/g, '    ')
    let initialIndent = content.match(/^\s+/g)
    if (initialIndent) {
        initialIndent = initialIndent[0]
        content = content.replace(new RegExp(`^${initialIndent}`, 'gm'), '')
    }
    content = content.trim()
    console.log(content)

    return Prism.highlight(content, Prism.languages[language], language)
})

</script>
