import { defineConfig } from 'vitepress'
import imageFiguresPlugin from './markdown-it-image-figures.js';
import { inlineHighlightPlugin } from './inline-highlight.js';
import overpyLanguage from './overpy-highlight.json';
import highlightLanguage from './highlight-language.json';
import { typographicReplacerPlugin } from './typographicReplacer.js';
import * as fs from 'node:fs';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Zezombye's Blog",
    description: "Programming, self-improvement, and various stuff",
    srcDir: "articles",
    cleanUrls: true,
    lang: "en-US",
    appearance: "force-dark",
    lastUpdated: true,
    markdown: {
        image: {
            lazyLoading: false, //to avoid potential issues with images not loading due to poor connection
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
            { icon: 'github', link: 'https://github.com/Zezombye' },
            { icon: 'twitter', link: 'https://twitter.com/Zezombye' },
            { icon: 'youtube', link: 'https://youtube.com/@Zezombye' },
        ]
    },
})
