import { defineConfig } from 'vitepress'
import imageFiguresPlugin from './markdown-it-image-figures.js';
import { inlineHighlightPlugin } from './inline-highlight.js';
import overpyLanguage from './overpy-highlight.json';
import { typographicReplacerPlugin } from './typographicReplacer.js';

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
        math: true,

        languages: [overpyLanguage],
        defaultHighlightLang: 'overpy',
        codeTransformers: [
            {
                line(line, lineNb) {
                    if (line.children.length === 0) {
                        return;
                    }
                    //Add indent as a separate span to allow for comment wrapping
                    //console.log("Code transformer line:", JSON.stringify(line, null, 4), lineNb);
                    let indent = line.children[0].children[0].value.match(/^ */)[0];

                    line.children[0].children[0].value = line.children[0].children[0].value.replace(/^ */, "");

                    if (indent) { //putting an empty span element breaks the line height for some reason
                        line.children.unshift({
                            type: 'element',
                            tagName: 'span',
                            properties: {
                                class: "indent",
                            },
                            children: [
                                {
                                    "type": "text",
                                    "value": indent,
                                }
                            ],
                        });
                    }
                    for (let child of line.children) {
                        //Unfortunately I did not find how to properly add includeExplanation to the shiki highlight, so this has to be changed if the theme changes.
                        if (child.properties.style === "--shiki-light:#6A737D;--shiki-dark:#6A737D") {
                            child.properties.class = "comment";

                            //Add a span with the comment start to allow for even neater wrapping
                            let commentStart = child.children[0].value.match(/^((\/\/|#|\/\*)\s*)/);
                            if (!commentStart) {
                                continue; //could be a continuation of a multiline comment
                            }
                            child.children[0].value = child.children[0].value.slice(commentStart[0].length);
                            child.children.unshift({
                                type: "element",
                                tagName: "span",
                                properties: {
                                    class: "comment-start",
                                },
                                children: [{
                                    type: "text",
                                    value: commentStart[0],
                                }],
                            })
                        }
                    }
                }
            }
        ],

        config: md => {
            md.use(imageFiguresPlugin, {
                figcaption: 'alt',
                lazyLoading: true,
                className: 'image-figures'
            });
            md.use(inlineHighlightPlugin);
            //md.use(blockHighlightPlugin);
            md.use(typographicReplacerPlugin);
            md.set({ breaks: true });
        },
        emoji: {
            enabled: false,
            shortcuts: {},
        },
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
        return code
    },*/
    /*async transformPageData(pageData, { siteConfig }) {
        if (pageData?.frontmatter?.defaultHighlightLang) {
            siteConfig.markdown.defaultHighlightLang = pageData.frontmatter.defaultHighlightLang;
        }
        console.log("Page data:", pageData);
        console.log("Site config:", siteConfig);
    }*/
})
