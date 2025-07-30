<template>
    <Layout>
        <!-- <template #doc-after>
            <pre>{{ JSON.stringify(data.page.value, null, 4) }}</pre>
        </template> -->
    </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
const Layout = DefaultTheme.Layout;

/*import { useData } from 'vitepress'
import { data as articles } from "../.vitepress/articles.data.js";

const data = useData();
console.log(data.page.value);

console.log(articles);

if (data.page.value.frontmatter.layout !== "home") {
    const currentArticle = articles.find(article => article.url === "/"+data.page.value.relativePath.replace(".md", ""));
    console.log(currentArticle.excerpt)
    const currentArticleTitleAnchorUrl = currentArticle.excerpt.match(/<a class="header-anchor" href="([^"]+)"/)[1];
}*/
</script>
