import { createContentLoader } from 'vitepress'

// https://vitepress.dev/guide/data-loading
export default createContentLoader('../articles/*.md', {
    excerpt: (file, options) => {
        file.excerpt = file.content.includes("\n##") ? file.content.substring(0, file.content.indexOf("\n##")) : file.content;
    }
})
