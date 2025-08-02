import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    if (request.headers.get("user-agent")?.match(/\bDiscordbot\b/i)) {
        const response = await context.next();
        const themeColor = "#69b8d7";
        let text = await response.text();
        text = text.replace("</head>", `<meta name="theme-color" content="${themeColor}"></head>`);
        return new Response(text, response);
    }
};
export const config: Config = {
    path: "/*",
};
