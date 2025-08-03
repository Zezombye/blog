<template>
    <a id="aside-title" class="outline-link" :href="currentArticleTitleAnchorUrl">{{ currentPageTitle }}</a>
</template>


<script setup>

import { useData } from 'vitepress'
import { data as articles } from "../.vitepress/articles.data.js";
import { computed } from 'vue';

const { page } = useData();

const currentPageTitle = computed(() => page.value.title);
const currentPagePath = computed(() => page.value.relativePath.replace(".md", ""));

const currentArticle = computed(() => articles.find(article => article.url === "/"+currentPagePath.value));
//console.log(currentArticle.value.excerpt)
const currentArticleTitleAnchorUrl = computed(() => {
    //console.log("currentArticle.value", currentArticle.value);
    if (!currentArticle.value.excerpt.match(/<a class="header-anchor" href="([^"]+)"/)) {
        throw new Error("No anchor found in current article excerpt: current article is " + currentArticle.value.url);
    }
    return currentArticle.value.excerpt.match(/<a class="header-anchor" href="([^"]+)"/)[1]
});

</script>
