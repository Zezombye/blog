<template>
    <div class="article-group">
        <span class="title">{{ title }}</span>
        <div class="articles">
            <span class="article" v-for="article in articles" :key="article.url">
                <a :href="`/${article.url}`">{{ article.title }}</a>
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
        type: Array,
        required: true
    }
});

</script>

<style scoped>
.article-group {
    background-color: var(--vp-c-bg-soft);
    flex: 1 0 300px;
    padding: 0px 24px;
    border-radius: 12px;
    max-width: 400px;
    width: 400px;
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

a {
    font-weight: 500;
    color: var(--vp-c-brand-1);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color .25s,opacity .25s;
    &:hover {
        color: var(--vp-c-brand-2);
    }
}
</style>
