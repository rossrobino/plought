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
	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-10Y495MZDX"
	></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());

		gtag("config", "G-10Y495MZDX");
	</script>
</svelte:head>

<h1>{title ? title : desc}</h1>

{#if title}
	<h2>{desc}</h2>
{/if}
