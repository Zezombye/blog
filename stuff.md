## Blogs about vitepress

https://ericgardner.info/notes/blogging-with-vitepress-january-2024
https://soubiran.dev/series/create-a-blog-with-vitepress-and-vue-js-from-scratch
https://abc.fractalf.net/articles/001-vitepress-as-a-blog.html#list-articles-automatically
https://adocs.vercel.app/guide.html


## Fully automated landing page

Could be useful in the future: https://medium.com/@jeremy3/create-components-in-vitepress-using-tailwind-a4eee4b4ec41

```js
import { createContentLoader } from 'vitepress'

export default createContentLoader('articles/*.md', {
    includeSrc: true,
    excerpt: true,
    transform(rawData) {
        return rawData
            .map((page) => ({
                title: page.frontmatter.title,
                url: page.url,
                excerpt: truncateText(page.frontmatter.description, 100),
                date: formatDate(page.frontmatter.date),
                image: getImagePath(page.url)
            }))
            .sort((a, b) => b.date.time - a.date.time)
    }
})
```

The official blog of vuejs has https://github.com/vuejs/blog/blob/main/.vitepress/genFeed.ts to generate feed.xml and the front page

## Customization

To override components: https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/components/
