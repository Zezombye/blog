<template>
    <div @click="isChecked = !isChecked"><input type="checkbox" :id="id" v-model="isChecked"/> <span :class="{'question-checked': isChecked}" v-html="displayedText"></span></div>
</template>

<script setup>

import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    t: {
        type: String,
        required: true
    },
});

const isChecked = ref(false);

onMounted(() => {
    //Initialize the checkbox state from local storage
    const storedValue = localStorage.getItem("fundamentals-q-"+props.id);
    if (storedValue !== null) {
        isChecked.value = storedValue === "true";
    }
});
watch(isChecked, (newValue) => {
    localStorage.setItem("fundamentals-q-"+props.id, newValue);
});

const displayedText = computed(() => {
    //Unfortunately, markdown is unsupported in components. Manually convert URLs to links.
    return props.t.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;")
    .replace(/(https?:\/\/[^\s\)\]\}]+)/g, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
})

</script>

<style scoped>
.question-checked {
    text-decoration: line-through;
    color: var(--vp-c-text-2);
}
</style>
