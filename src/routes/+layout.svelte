<script lang="ts">
	import { dev } from "$app/env";
	import { afterNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import faviconDark from "#lib/assets/favicon-dark.png";
	import faviconLight from "#lib/assets/favicon-light.png";
	import "./app.css";
	import { inject, pageview } from "@vercel/analytics";

	if (!dev) {
		// The Analytics SvelteKit integration still imports the removed $app/stores.
		inject(
			{
				mode: "production",
				disableAutoTrack: true,
				framework: "sveltekit",
				basePath: import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH,
			},
			import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG,
		);
		afterNavigate(() => {
			if (page.route.id) {
				pageview({ route: page.route.id, path: page.url.pathname });
			}
		});
	}

	let { children } = $props();
</script>

<svelte:head>
	<link href={faviconLight} rel="icon" media="(prefers-color-scheme: dark)" />
	<link href={faviconDark} rel="icon" media="(prefers-color-scheme: light)" />
</svelte:head>

<div class="selection:bg-foreground selection:text-background">
	{@render children()}
</div>
