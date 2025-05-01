import { defineConfig } from 'vitepress'
import imageFiguresPlugin from './markdown-it-image-figures.js';
import { inlineHighlightPlugin } from './inline-highlight.js';
import overpyLanguage from './overpy-highlight.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Zezombye's Blog",
    description: "Programming, self-improvement, and various stuff",
    srcDir: "articles",
    cleanUrls: true,
    lang: "en-US",
    appearance: "dark",
    lastUpdated: true,
    markdown: {
        image: {
            lazyLoading: true,
        },

        languages: [overpyLanguage],
        defaultHighlightLang: 'overpy',

        config: md => {
            md.use(imageFiguresPlugin, {
                figcaption: 'alt',
                lazyLoading: true,
                className: 'image-figures'
            });
            md.use(inlineHighlightPlugin);
        }
    },
    emoji: {
        enabled: false,
    },
    themeConfig: {

        // https://vitepress.dev/reference/default-theme-config
        /*nav: [
            { text: 'Home', link: '/' },
            { text: 'Examples', link: '/markdown-examples' }
        ],*/
        //outline: false,
        outline: {
            level: [2, 3],
            label: "Table of contents",
        },

        footer: {
            //message: "[VitePress is goat](https://vitepress.dev) | [Source](https://github.com/Zezombye/blog/) | © 2025 Zezombye",
            message: `<a href="https://vitepress.dev">VitePress is goat</a> | <a href="https://github.com/Zezombye/blog/">Source</a> | © 2025 Zezombye`,
            /*message: `
            <div style="display: flex;">
                <span style="flex:1; text-align:left;"><a href="https://vitepress.dev">VitePress is goat</a></span>
                <span>Copyright © 2025 Zezombye</span>
                <span style="flex:1; text-align: right;"><a href="https://github.com/Zezombye/blog/">Source</a></span>
            </div>
            `,*/
        },

        /*sidebar: [
            {
                text: 'Examples',
                items: [
                    { text: 'Markdown Examples', link: '/markdown-examples' },
                    { text: 'Runtime API Examples', link: '/api-examples' }
                ]
            }
        ],*/

        socialLinks: [
            { icon: 'github', link: 'https://github.com/Zezombye' }
        ]
    },
    /*async transformHtml(code, id, context) {
        //Doesn't work if loading the page from another page
        return code.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d\u2032]/g, '"').replace(/[\u2012\u2013]/g, "-").replaceAll("\u2014", "--").replaceAll("\u2026", "...");
    },*/
    /*async transformPageData(pageData, { siteConfig }) {
        if (pageData?.frontmatter?.defaultHighlightLang) {
            siteConfig.markdown.defaultHighlightLang = pageData.frontmatter.defaultHighlightLang;
        }
        console.log("Page data:", pageData);
        console.log("Site config:", siteConfig);
    }*/
})
