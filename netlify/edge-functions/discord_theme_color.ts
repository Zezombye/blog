import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    if (request.headers.get("user-agent")?.match(/\bDiscordbot\b/i)) {
        const response = await context.next();
        const themeColor = "#63c6ee";
        let text = await response.text();
        text = text.replace("</head>", `<meta name="theme-color" content="${themeColor}"></head>`);
        return new Response(text, response);
    }
};
export const config: Config = {
    path: "/*",
    excludedPath: ["/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg", "/*.ico"],
};
