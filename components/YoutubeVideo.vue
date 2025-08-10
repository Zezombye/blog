<template>
    <p style="display: flex; justify-content: center"><iframe style="max-width: 560px; width: 100%; aspect-ratio: 16/9;" :src="'https://www.youtube.com/embed/'+videoId" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>
</template>

<script setup>

const props = defineProps({
    id: {
        type: String,
        required: true,
    }
});

const videoId = props.id.startsWith("https://www.youtube.com/watch?v=") ? new URL(props.id).searchParams.get("v") : props.id;

</script>
