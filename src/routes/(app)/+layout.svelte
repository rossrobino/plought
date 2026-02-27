<script lang="ts">
	import { page } from "$app/state";
	import Head from "$lib/components/Head.svelte";
	import { apps } from "$lib/info";

	let { children } = $props();

	// ignore the "/about" end of path
	const path = `/${page.url.pathname.split("/").slice(1, 2)}`;

	// find the app that matches the current path
	const app = apps.find((app) => app.path === path);
</script>

{#if app}
	<Head title={app.title} desc={app.desc} />
	<div class="-mx-4 grid grid-flow-col border-b">
		<a
			class="rounded-t-xl px-4 py-3"
			class:bg-s={page.url.pathname === app.path}
			class:text-base={page.url.pathname === app.path}
			href={app.path}
		>
			App
		</a>
		<a
			class="rounded-t-xl px-4 py-3"
			class:bg-s={page.url.pathname === `${app.path}/about`}
			class:text-base={page.url.pathname !== app.path}
			href="{app.path}/about"
		>
			Learn
		</a>
	</div>

	{@render children?.()}

	{#if page.url.pathname === `${app.path}/about`}
		<div class="mt-8">
			<a href={app.path} class="btn btn-s px-4">Try it out</a>
		</div>
	{/if}
{/if}
