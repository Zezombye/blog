import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    let faviconFiles = [
        "favicon.png",
        "favicon_112.5.png",
        "favicon_157.5.png",
        "favicon_180.png",
        "favicon_202.5.png",
        "favicon_22.5.png",
        "favicon_247.5.png",
        "favicon_270.png",
        "favicon_292.5.png",
        "favicon_337.5.png",
        "favicon_67.5.png",
        "favicon_90.png",
    ]
    return Response.redirect("/"+faviconFiles[Math.floor(Math.random() * faviconFiles.length)], 302);
};
export const config: Config = {
    path: "/favicon.ico",
};
