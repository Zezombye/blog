import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    if (request.headers.get("user-agent")?.match(/\b(Windows)?PowerShell\b/i)) {
        return new URL("/windows-setup.ps1", request.url);
    }
    if (request.headers.get("user-agent")?.match(/^(Wget|curl)\b\//)) {
        return new URL("/.bashrc", request.url);
    }
    return;
};
export const config: Config = {
    path: "/",
};
