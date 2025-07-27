import { createContentLoader } from 'vitepress'

// https://vitepress.dev/guide/data-loading
export default createContentLoader('../articles/*.md', {excerpt: true})
