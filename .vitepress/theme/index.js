// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Footnote from '../../components/Footnote.vue'
import CustomLayout from '../../components/CustomLayout.vue'
import './style.css'

const Layout = DefaultTheme.Layout;

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app, router, siteData }) {
    app.component('Footnote', Footnote)
  }
}
