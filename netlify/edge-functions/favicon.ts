import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    let faviconFiles = [
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon.png",
        "favicon_180.png",
        "favicon_270.png",
        "favicon_90.png",
    ]
    return Response.redirect("/"+faviconFiles[Math.floor(Math.random() * faviconFiles.length)], 302);
};
export const config: Config = {
    path: "/favicon.ico",
};
