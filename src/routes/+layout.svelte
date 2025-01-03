<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import { info } from "$lib/info";

	inject({ mode: dev ? "development" : "production" });

	let { children } = $props();
</script>

<div
	class="mx-auto flex h-[100dvh] max-w-[90ch] flex-col justify-between selection:bg-content selection:text-base"
>
	<main class="p-4">
		{@render children?.()}
	</main>
	<footer
		class="mt-8 flex max-w-full items-center justify-end p-4 text-content"
	>
		<a href={info.github}>
			<img src="/plought-text-logo-dark.svg" alt="Plought" class="w-24" />
		</a>
	</footer>
</div>
