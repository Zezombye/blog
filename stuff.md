## Blogs about vitepress

- https://ericgardner.info/notes/blogging-with-vitepress-january-2024
- https://soubiran.dev/series/create-a-blog-with-vitepress-and-vue-js-from-scratch
- https://abc.fractalf.net/articles/001-vitepress-as-a-blog.html#list-articles-automatically
- https://adocs.vercel.app/guide.html
- https://olets.dev/posts/per-page-dynamic-social-metas-in-vitepress/

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

## Blog inspirations

- https://lutrasecurity.com/en/philosophy/
- https://nullprogram.com/
- https://www.5snb.club/
- https://www.nullpt.rs/
- https://www.armaansahni.com/how-i-coded-a-game-using-ai/ (parenting goals fr)
- https://turso.tech/blog/introducing-limbo-a-complete-rewrite-of-sqlite-in-rust
- https://www.00xbyte.com/posts/hacking-dash-cams/ (website layout, sidebar, tags, etc)
- https://dylanhuang.com/blog/closing-my-startup/
- https://eaton-works.com/2024/12/19/mcdelivery-india-hack/
- https://jonot.me/portfolio/
- https://www.founderodyssey.com/ (very nice design)
- https://purplesyringa.moe
- https://eieio.games/blog/writing-down-every-uuid/ 
- https://harlanzw.com/blog - nice glow/underline/pulse effect
- https://antfu.me/ - the guy she tells you not to worry about
