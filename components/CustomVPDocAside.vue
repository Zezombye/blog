<template>
    
    <div class="VPDocAside">
        <slot name="aside-top" />

        <slot name="aside-outline-before" />
        <a id="aside-title" class="outline-link" :href="currentArticleTitleAnchorUrl">{{ data.page.value.title }}</a>
        <VPDocAsideOutline />
        <slot name="aside-outline-after" />

        <div class="spacer" />

        <slot name="aside-bottom" />
    </div>
</template>

<script setup>

import { useData } from 'vitepress'
import { data as articles } from "../.vitepress/articles.data.js";
import VPDocAsideOutline from "vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue";

const data = useData();
console.log(data.page.value);

console.log(articles);

const currentArticle = articles.find(article => article.url === "/"+data.page.value.relativePath.replace(".md", ""));
console.log(currentArticle.excerpt)
const currentArticleTitleAnchorUrl = currentArticle.excerpt.match(/<a class="header-anchor" href="([^"]+)"/)[1];

</script>

<style scoped>
.VPDocAside {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.spacer {
  flex-grow: 1;
}

.VPDocAside :deep(.spacer + .VPDocAsideSponsors),
.VPDocAside :deep(.spacer + .VPDocAsideCarbonAds) {
  margin-top: 24px;
}

.VPDocAside :deep(.VPDocAsideSponsors + .VPDocAsideCarbonAds) {
  margin-top: 16px;
}
</style>
