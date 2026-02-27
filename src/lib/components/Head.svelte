<script lang="ts">
	import { info } from "$lib/info";

	let { title = "", desc = "" } = $props();
	const headTitle = $derived(title ? `${info.name} - ${title}` : info.name);
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={desc} />
	<meta name="keywords" content="decision, making, weighted, sum" />
</svelte:head>

<header class="-mx-4 mb-8 bg-background px-4 pb-4 text-foreground">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<a href="/" class="no-underline">
				<img src="/plought-text-logo-dark.svg" alt="Plought" class="w-32" />
			</a>
			<h1
				class="hidden rounded-md bg-accent px-2 py-1 text-lg font-semibold sm:block"
			>
				{title ? title : desc}
			</h1>
		</div>
	</div>
	<div class="mt-4 block sm:hidden">
		<h1
			class="rounded-md bg-accent px-2 py-1 text-center text-lg font-semibold"
		>
			{title ? title : desc}
		</h1>
	</div>
</header>
