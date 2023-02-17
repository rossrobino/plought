<script lang="ts">
	import { page } from "$app/stores";
	import Head from "$lib/components/Head.svelte";
	import { apps } from "$lib/info";

	// ignore the "/about" end of path
	const path = `/${$page.url.pathname.split("/").slice(1, 2)}`;

	// find the app that matches the current path
	const app = apps.find((app) => app.path === path);
</script>

{#if app}
	<Head title={app.title} desc={app.desc} />
	<div class="-mx-4 grid grid-flow-col border-b-4 border-slate-900">
		<a
			class="rounded-tr bg-slate-100 px-4 py-3"
			class:bg-slate-300={$page.url.pathname === app.path}
			href={app.path}
		>
			App
		</a>
		<a
			class="rounded-tl bg-slate-100 px-4 py-3"
			class:bg-slate-300={$page.url.pathname === `${app.path}/about`}
			href="{app.path}/about"
		>
			Learn
		</a>
	</div>
	<slot />
	{#if $page.url.pathname === `${app.path}/about`}
		<div>
			<p><a href={app.path}>Try it out</a></p>
		</div>
	{/if}
{/if}
