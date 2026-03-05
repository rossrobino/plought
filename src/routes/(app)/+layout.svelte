<script lang="ts">
	import { page } from "$app/state";
	import Head from "$lib/components/head.svelte";
	import { apps } from "$lib/info";

	let { children } = $props();

	const path = $derived.by(() => {
		const pathname = page.url.pathname;
		const next = pathname.indexOf("/", 1);
		return next === -1 ? pathname : pathname.slice(0, next);
	});
	const app = $derived(apps.find((item) => item.path === path));
</script>

{#if app}
	<Head title={app.title} desc={app.desc} />
	{@render children()}
{/if}
