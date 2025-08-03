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
const currentArticleTitleAnchorUrl = computed(() => currentArticle.value.excerpt.match(/<a class="header-anchor" href="([^"]+)"/)[1]);

</script>
