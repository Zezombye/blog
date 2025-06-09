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
                /*span(node, line, col, lineElement, token) {
                    console.log("Code transformer span:", node, line, col, lineElement, token);
                }*/
                /*tokens(tokens) {
                        console.log("Code transformer tokens:", tokens.map(x => JSON.stringify(x)));
                }*/
                /*preprocess(code, options) {
                    console.log("Code transformer preprocess:", code, options);
                }*/
                /*code(hast) {
                    console.log("Code transformer code:", JSON.stringify(hast, null, 4));
                }*/
                line(line, lineNb) {
                    if (line.children.length === 0) {
                        return;
                    }
                    //console.log("Code transformer line:", JSON.stringify(line, null, 4), lineNb);
                    let indentLevel = line.children[0].children[0].value.match(/^\s*/)[0].length;
                    //Remove indent level, we will set it in css
                    line.children[0].children[0].value = line.children[0].children[0].value.trimStart();
                    if (indentLevel % 4 !== 0) {
                        console.log("Code transformer line:", JSON.stringify(line, null, 4), lineNb);
                        throw new Error(`Indentation error: line starts with ${indentLevel} spaces, expected a multiple of 4 spaces.`);
                    }
                    indentLevel /= 4;
                    line.properties.class += " indent-level-" + indentLevel;
                    /*line.children.unshift({
                        type: 'element',
                        tagName: 'div',
                        properties: {
                            class: "indent-level-" + indentLevel,
                        },
                        children: [
                            {
                                "type": "text",
                                "value": "",
                            }
                        ],
                    });*/

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
