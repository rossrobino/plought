<script lang="ts">
	import { page } from "$app/state";
	import { info } from "$lib/info";
	import { getSeo } from "$lib/seo";

	let { title = "", desc = "" } = $props();
	const fallback = $derived(getSeo(page.url.pathname));
	const baseUrl = info.url.replace(/\/$/, "");
	const path = $derived(
		page.url.pathname.length > 1 && page.url.pathname.endsWith("/")
			? page.url.pathname.slice(0, -1)
			: page.url.pathname,
	);
	const canonicalUrl = $derived(new URL(path || "/", `${baseUrl}/`).toString());
	const resolvedTitle = $derived(title || fallback?.title || "");
	const headTitle = $derived(
		resolvedTitle ? `${resolvedTitle} | ${info.name}` : info.name,
	);
	const headDesc = $derived(desc || fallback?.desc || info.tagline);
	const structuredData = $derived(
		JSON.stringify({
			"@context": "https://schema.org",
			"@graph": [
				{
					"@type": "WebSite",
					name: info.name,
					url: baseUrl,
					description: info.tagline,
				},
				{
					"@type": "WebApplication",
					name: info.name,
					applicationCategory: "BusinessApplication",
					operatingSystem: "Web",
					url: canonicalUrl,
					description: headDesc,
				},
			],
		}).replaceAll("<", "\\u003c"),
	);
	const structuredDataTag = $derived(
		`<script type="application/ld+json">${structuredData}</scr` + "ipt>",
	);
</script>

<svelte:head>
	<title>{headTitle}</title>
	<link rel="canonical" href={canonicalUrl} />
	<meta name="description" content={headDesc} />
	<meta name="keywords" content="decision, making, weighted, sum" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={info.name} />
	<meta property="og:title" content={headTitle} />
	<meta property="og:description" content={headDesc} />
	<meta property="og:url" content={canonicalUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDesc} />
	{@html structuredDataTag}
</svelte:head>
