export function fixPunctuationWrapPlugin(md) {
    
    function processInlineTokens(tokens, state) {
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type !== "math_inline" && token.type !== "code_inline") {
                continue;
            }

            let startSpanIdx = i;
            if (i > 0 && tokens[i - 1].type === 'text' && !/\s/.test(tokens[i - 1].content.slice(-1))) {
                let priorTextToken = new state.Token("text", '', 0);
                priorTextToken.content = tokens[i - 1].content.match(/\S+$/)[0];
                tokens[i - 1].content = tokens[i - 1].content.slice(0, -priorTextToken.content.length);
                tokens.splice(i, 0, priorTextToken);
                i++;
            }

            let endSpanIdx = i + 1;
            if (i + 1 < tokens.length && tokens[i + 1].type === 'text' && !/\s/.test(tokens[i + 1].content[0])) {
                let nextTextToken = new state.Token("text", '', 0);
                nextTextToken.content = tokens[i + 1].content.match(/^\S+/)[0];
                tokens[i + 1].content = tokens[i + 1].content.slice(nextTextToken.content.length);
                tokens.splice(i + 1, 0, nextTextToken);
                endSpanIdx++;
            }

            tokens.splice(startSpanIdx, 0, new state.Token('span_open', 'span', 1));
            tokens[startSpanIdx].attrSet('style', 'white-space: nowrap');
            endSpanIdx++;
            tokens.splice(endSpanIdx, 0, new state.Token('span_close', 'span', -1));

            i = endSpanIdx;
        }
    }

    md.core.ruler.after('inline', 'fix_punctuation_wrap', (state) => {
        for (const token of state.tokens) {
            if (token.type !== 'inline' || !token.children || token.children.length === 0) {
                continue;
            }
            // Filter out empty text nodes
            token.children = token.children.filter(child => {
                return !(child.type === 'text' && child.content.trim() === '');
            });
            processInlineTokens(token.children, state);
        }
    });
}
