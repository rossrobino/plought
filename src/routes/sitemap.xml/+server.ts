import { info } from "$lib/info";
import { seoByPath, seoPaths } from "$lib/seo";
import { getAllPostsMeta } from "$lib/server/blog";
import type { RequestHandler } from "./$types";

const normalizeBase = (value: string) => {
	const trimmed = value.trim();
	if (trimmed.endsWith("/")) {
		return trimmed.slice(0, -1);
	}
	return trimmed;
};

const escapeXml = (value: string) => {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
};

const getBaseUrl = (origin: string) => {
	if (info.url.trim().length > 0) {
		return normalizeBase(info.url);
	}
	return normalizeBase(origin);
};

const renderUrl = (
	base: string,
	path: string,
	lastmod: string,
	changefreq?: string,
	priority?: number,
) => {
	const loc = new URL(path, `${base}/`).toString();
	return `<url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod>${changefreq == null ? "" : `<changefreq>${changefreq}</changefreq>`}${priority == null ? "" : `<priority>${priority.toFixed(1)}</priority>`}</url>`;
};

export const GET: RequestHandler = async ({ url }) => {
	const base = getBaseUrl(url.origin);
	const lastmod = new Date().toISOString();
	const posts = await getAllPostsMeta();

	const urls = [
		...seoPaths.map((path) => {
			const meta = seoByPath[path];
			return renderUrl(base, path, lastmod, meta.changefreq, meta.priority);
		}),
		...posts.map((post) => renderUrl(base, `/blog/${post.slug}`, post.date)),
	].join("");

	const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

	return new Response(body, {
		headers: {
			"cache-control": "public, max-age=3600",
			"content-type": "application/xml; charset=utf-8",
		},
	});
};
