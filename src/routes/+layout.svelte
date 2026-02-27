<script lang="ts">
	import { dev } from "$app/environment";
	import "./app.css";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });

	let { children } = $props();
</script>

<div
	class="mx-auto flex h-dvh max-w-5xl flex-col justify-between selection:bg-content selection:text-base"
>
	<main class="p-4">
		{@render children()}
	</main>
</div>
