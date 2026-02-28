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
