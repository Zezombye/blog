// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Footnote from '../../components/Footnote.vue'
import CustomLayout from '../../components/CustomLayout.vue'
import './style.css'
import ArticleGroup from '../../components/ArticleGroup.vue'
import AllArticles from '../../components/AllArticles.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app, router, siteData }) {
    app.component('Footnote', Footnote)
    app.component('ArticleGroup', ArticleGroup)
    app.component("AllArticles", AllArticles)
  }
}
