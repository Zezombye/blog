// https://github.com/vuejs/vitepress/pull/1366

export const inlineHighlightPlugin = (md) => {
    const codeRender = md.renderer.rules.code_inline
    md.renderer.rules.code_inline = (...args) => {
        const [tokens, idx, options, config] = args
        //console.log(config.frontmatter)
        const token = tokens[idx]
        let language = token.attrs?.[0]?.[0] || config.frontmatter.defaultHighlightLang
        if (language && options.highlight) {
            const htmlStr = options.highlight(token.content, language, '')
            return htmlStr.replace(/^<pre class="/, '<span class="inline-code-highlight ').replace(/<\/pre>$/, "</span>")
        } else {
            return codeRender(...args)
        }
    }
}
