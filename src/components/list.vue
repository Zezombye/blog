<template>
    <renderedList></renderedList>
</template>

<script lang="jsx" setup>

import { useSlots, ref, onMounted, computed, inject } from 'vue'

const slots = useSlots()
let listContent = slots.default()[0].children
console.log(listContent)

const renderedList = computed(() => {

    listContent = listContent.trim()
    let listType = null;
    let listLines = listContent.split(/\n/).map(line => line.trim()).filter(line => line.length > 0)
    if (listLines[0].startsWith("- ")) {
        listType = "-"
        listLines = listLines.map(line => line.replace(/^- /, ''))
    } else if (listLines[0].startsWith("1. ")) {
        listType = "1"
        listLines = listLines.map(line => line.replace(/^\d+\. /, ''))
    } else if (listLines[0].startsWith("A. ")) {
        listType = "A"
        listLines = listLines.map(line => line.replace(/^\w+\. /, ''))
    } else {
        throw new Error("Could not find list type for list: ", listContent)
    }

    let listLinesHtml = listLines.map((line, index) => {
        return <li key={index} class={listType}>
            {line}
        </li>
    })

    let result = (listType === "-" ? <ul>{listLinesHtml}</ul> : <ol type={listType}>{listLinesHtml}</ol>)

    console.log(result)
    return result
})

</script>
