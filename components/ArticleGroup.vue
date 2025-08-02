<template>
    <div class="article-group">
        <span class="title">{{ title }}</span>
        <div class="articles">
            <span class="article" v-for="(name, key) in articles" :key="key">
                <a :href="`/${key}`">{{ name }}</a>
            </span>
        </div>
        <!-- <ul>
            <li class="article" v-for="(name, key) in articles" :key="key">
                <a :href="`/${key}`">{{ name }}</a>
            </li>
        </ul> -->
    </div>
</template>

<script setup>

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    articles: {
        type: Object,
        required: true
    }
});

</script>

<style scoped>
.article-group {
    background-color: var(--vp-c-bg-soft);
    padding: 0px 24px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    width: 100%;
    padding: 24px 0;
}

.articles {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    height: 100%;
    border-top: 1px solid var(--vp-c-divider);
    padding: 24px 0;

    @media (max-width: 639px) {
        border: none;
        padding-top: 0px;
    }
}

.article {
    text-align: center;
    font-size: 15px;
}
</style>
