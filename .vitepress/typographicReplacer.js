export function fixTypography(text) {
    return text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201c\u201d\u2032]/g, '"')
        .replace(/[\u2012\u2013]/g, "-")
        .replaceAll("\u2026", "...")
        .replaceAll("\u00A0", " ")
        .replaceAll("™️", "™")
        .replaceAll("®️", "®")
        .replaceAll("©️", "©")
        .replaceAll("§currentYear§", new Date().getFullYear().toString());
}

export const typographicReplacerPlugin = (md) => {
    md.core.ruler.after('replacements', 'typographic_replacer', (state) => {
        state.tokens.forEach((blockToken) => {
            if (blockToken.type === 'inline' && blockToken.children) {
                blockToken.children.forEach((token) => {
                    if (["text", "emoji"].includes(token.type)) {
                        token.content = fixTypography(token.content);
                    } else {
                        //console.log(token);
                    }
                });
            }
        });
    });
}
