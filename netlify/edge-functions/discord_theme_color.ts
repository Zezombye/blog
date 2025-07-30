import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    if (request.headers.get("user-agent")?.match(/\bDiscordbot\b/i)) {
        const response = await context.next();
        const themeColor = "#A3E7FF";
        let text = await response.text();
        text = text.replace("<head>", `<head><meta name="theme-color" content="${themeColor}">`);
        return new Response(text, response);
    }
};
