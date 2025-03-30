<!-- Code Block -->

<template><pre><c v-bind="$attrs"><slot></slot></c></pre></template>

<style scoped>
pre {
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;

    line-height: 1.4;
    font-size: 14px;
    background-color: #1E1E1E;
}
</style>

<script setup>
defineOptions({
    inheritAttrs: false
})
</script>
