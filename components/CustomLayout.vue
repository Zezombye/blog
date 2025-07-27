<template>
    <Layout>
        <template #doc-after>
            <!-- <pre>{{ JSON.stringify(data.page.value, null, 4) }}</pre> -->
        </template>
        <template #aside-outline-before>
            <div class="aside-title">{{ data.page.value.title }}</div>
        </template>
    </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { data as articles } from "../.vitepress/articles.data.js";
const Layout = DefaultTheme.Layout;

const data = useData();
console.log(data.page.value.title);

//console.log(articles);


</script>
