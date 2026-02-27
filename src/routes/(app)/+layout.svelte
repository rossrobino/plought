<script lang="ts">
	import { page } from "$app/state";
	import Head from "$lib/components/Head.svelte";
	import { apps } from "$lib/info";

	let { children } = $props();

	const path = $derived(`/${page.url.pathname.split("/").slice(1, 2)}`);
	const app = $derived(apps.find((item) => item.path === path));
</script>

{#if app}
	<Head title={app.title} desc={app.desc} />
	{@render children()}
{/if}
