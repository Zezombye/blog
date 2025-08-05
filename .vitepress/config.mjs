import { defineConfig } from 'vitepress'
import imageFiguresPlugin from './markdown-it-image-figures.js';
import { inlineHighlightPlugin } from './inline-highlight.js';
import overpyLanguage from './overpy-highlight.json';
import highlightLanguage from './highlight-language.json';
import { typographicReplacerPlugin } from './typographicReplacer.js';
import { markdownItFancyListPlugin } from './markdown-it-fancy-lists.ts';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Zezombye's Blog",
    //description: "Programming, self-improvement, and various stuff",
    description: "Zezombye's Blog",
    srcDir: "articles",
    cleanUrls: true,
    lang: "en-US",
    appearance: "force-dark",
    lastUpdated: true,
    markdown: {
        image: {
            //lazyLoading: false, //to avoid potential issues with images not loading due to poor connection
            lazyLoading: true,
        },
        math: true,

        languages: [overpyLanguage, highlightLanguage],
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
                        //We put two indent spans; the first one will get displayed as 2 spaces for mobile, the second one is additional indent (eg for a comment) and should be kept.
                        let indentStart = indent.slice(0, Math.floor(indent.length/4)*4);
                        let additionalIndent = indent.slice(Math.floor(indent.length/4)*4);
                        if (additionalIndent) {
                            line.children.unshift({
                                type: 'element',
                                tagName: 'span',
                                properties: {
                                    class: "indent",
                                },
                                children: [{
                                    type: "text",
                                    value: additionalIndent,
                                }],
                            });
                        }
                        if (indentStart) {
                            line.children.unshift({
                                type: 'element',
                                tagName: 'span',
                                properties: {
                                    class: "indent indent-start",
                                },
                                children: [
                                    {
                                        "type": "text",
                                        "value": indentStart,
                                    }
                                ],
                            });
                        }
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
            md.use(markdownItFancyListPlugin);
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

        logo: "data:image/png;base64,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",

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
            { icon: 'github', link: 'https://github.com/Zezombye' },
            { icon: 'twitter', link: 'https://twitter.com/Zezombye' },
            { icon: 'youtube', link: 'https://youtube.com/@Zezombye' },
        ],
        notFound: {
            quote: "If this is not a typo, please report it to me so I can fix it :)",
            linkText: "Go to homepage",
        }
    },
    transformPageData(pageData) {
        const isHomePage = pageData.frontmatter.layout === 'home';
        
        const pageTitle = pageData.title || pageData.frontmatter.title || "Zezombye's Blog";
        const pageDescription = isHomePage ? "Programming, self-improvement, and various stuff" : pageData.frontmatter.description || "Zezombye's Blog";
        const pageImage = pageData.frontmatter.image ? "https://zez.dev/"+pageData.frontmatter.image.replace(".svg", ".jpg") : "https://zez.dev/pfp_200x200.png";

        const relativePath = isHomePage ? "" : pageData.relativePath.replace(/\.md$/, "");

        pageData.frontmatter.head ??= [];

        pageData.frontmatter.head.push(
            ["meta", { property: "og:title", content: pageTitle}],
            ["meta", { name: "twitter:description", content: pageDescription}],
            ["meta", { name: "twitter:title", content: pageTitle}],
            ["meta", { name: "twitter:description", content: pageDescription}],
            ["meta", { name: "twitter:creator", content: "@Zezombye"}],
            ["meta", { name: "twitter:card", content: pageData.frontmatter.image ? "summary_large_image" : "summary"}],
            ["meta", { property: "og:image", content: pageImage }],
            ["meta", { name: "twitter:image", content: pageImage }],
            ["link", { rel: "canonical", href: `https://zez.dev/${relativePath}` }],
        );
        if (isHomePage) {
            return {
                description: pageDescription,
            }
        }
    },
    sitemap: {
        hostname: "https://zez.dev",
    }
})
