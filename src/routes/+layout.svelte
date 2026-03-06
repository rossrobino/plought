<script lang="ts">
	import { dev } from "$app/environment";
	import faviconDark from "$lib/assets/favicon-dark.png";
	import faviconLight from "$lib/assets/favicon-light.png";
	import "./app.css";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";

	if (!dev) injectAnalytics({ mode: "production" });

	let { children } = $props();
</script>

<svelte:head>
	<link href={faviconLight} rel="icon" media="(prefers-color-scheme: dark)" />
	<link href={faviconDark} rel="icon" media="(prefers-color-scheme: light)" />
</svelte:head>

<div class="selection:bg-foreground selection:text-background">
	{@render children()}
</div>
