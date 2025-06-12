import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    if (request.headers.get("user-agent")?.match(/\b(Windows)?PowerShell\b/i)) {
        return new URL("/windows-setup.ps1", request.url);
    }
    if (request.headers.get("user-agent")?.match(/^(Wget|curl)\b\//)) {
        // Fetch the bashrc file content
        return new URL("/bashrc.sh", request.url);
    }
    if (request.url.endsWith("/bashrc.sh")) {
        const bashrcUrl = new URL("/bashrc.sh", request.url);
        const bashrcResponse = await fetch(bashrcUrl);

        if (!bashrcResponse.ok) {
            return new Response("File not found", { status: 404 });
        }

        // Return the content with Content-Disposition header to set filename
        return new Response(bashrcResponse.body, {
            headers: {
                ...Object.fromEntries(bashrcResponse.headers),
                "Content-Disposition": "attachment; filename=\".bashrc\"",
                "Content-Type": "text/plain",
            }
        });
    }
    return;
};
export const config: Config = {
    path: "/",
};
