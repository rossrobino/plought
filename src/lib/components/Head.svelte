<script lang="ts">
	import { info } from "$lib/info";
	import { Icon } from "@liquidiqq/iconkit";

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

<header class="-mx-4 mb-8 bg-base px-4 pb-4 text-content">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<a href="/">
				<img src="/plought-text-logo-dark.svg" alt="Plought" class="w-32" />
			</a>
			<h1
				class="hidden rounded-xl bg-s-100 py-1 px-2 text-lg font-semibold sm:block"
			>
				{title ? title : desc}
			</h1>
		</div>
		<a href={info.github} aria-label="GitHub repository" class="w-6">
			<Icon name="github-logo" />
		</a>
	</div>
	<div class="mt-4 block sm:hidden">
		<h1 class="rounded-xl bg-s-100 py-1 px-2 text-center text-lg font-semibold">
			{title ? title : desc}
		</h1>
	</div>
</header>
