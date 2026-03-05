<script lang="ts">
	import { page } from "$app/state";
	import { info } from "$lib/info";
	import { getSeo } from "$lib/seo";

	let { title = "", desc = "" } = $props();
	const fallback = $derived(getSeo(page.url.pathname));
	const headTitle = $derived(title ? `${title} | ${info.name}` : info.name);
	const headDesc = $derived(desc || fallback?.desc || info.tagline);
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDesc} />
	<meta name="keywords" content="decision, making, weighted, sum" />
</svelte:head>
