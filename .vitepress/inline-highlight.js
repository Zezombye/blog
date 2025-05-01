// https://github.com/vuejs/vitepress/pull/1366

export const inlineHighlightPlugin = (md) => {
    const codeRender = md.renderer.rules.code_inline
    md.renderer.rules.code_inline = (...args) => {
        const [tokens, idx, options, config] = args
        //console.log(config.frontmatter)
        const token = tokens[idx]
        let language = token.attrs?.[0]?.[0] || config.frontmatter.defaultHighlightLang
        if (language && options.highlight) {
            let addInlineBlock = (token.content.length < 15)
            //Add <wbr> to allow line breaks after parentheses/brackets
            token.content = token.content.replace(/([\(\[\{])/g, "$1\uE86F")
            let htmlStr = options.highlight(token.content, language, '')
            htmlStr = htmlStr.replaceAll("\uE86F", "<wbr>");
            return htmlStr.replace(/^<pre class="/, '<span class="inline-code-highlight ' + (addInlineBlock ? "inline-block " : "")).replace(/<\/pre>$/, "</span>")
        } else {
            return codeRender(...args)
        }
    }
}
