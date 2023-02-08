<script lang="ts">
	import { info } from "$lib/info";

	export let title = "";
	export let desc = "";

	let headTitle = info.name;

	if (title) {
		headTitle = `${info.name} - ` + title;
	}
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={desc} />
	<meta name="keywords" content="decision, making, weighted, sum" />
</svelte:head>

<h1>{title ? title : desc}</h1>

{#if title}
	<h2>{desc}</h2>
{/if}
