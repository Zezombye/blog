<template>
    <Layout>
        <template #home-features-before>
            <AllArticles/>
        </template>
        <template #doc-bottom>
            <AllArticles/>
        </template>
    </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import AllArticles from './AllArticles.vue';
const Layout = DefaultTheme.Layout;
</script>
