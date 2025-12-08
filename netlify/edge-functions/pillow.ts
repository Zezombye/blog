import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", 302);
};
export const config: Config = {
    path: "/pillow",
};
