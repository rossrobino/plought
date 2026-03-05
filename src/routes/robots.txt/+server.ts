import { info } from "$lib/info";
import type { RequestHandler } from "./$types";

const baseUrl = info.url.replace(/\/$/, "");

export const GET: RequestHandler = () => {
	const body = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
	return new Response(body, {
		headers: {
			"cache-control": "public, max-age=3600",
			"content-type": "text/plain; charset=utf-8",
		},
	});
};
