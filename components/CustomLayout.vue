<template>
    <Layout>
        <template #home-features-before>
            <AllArticles/>
        </template>
        <template #doc-bottom>
            <AllArticles/>
        </template>
        <template #aside-outline-before>
            <AsideTitle/>
        </template>
    </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme-without-fonts'
import AllArticles from './AllArticles.vue';
import AsideTitle from './AsideTitle.vue';
const Layout = DefaultTheme.Layout;
</script>
