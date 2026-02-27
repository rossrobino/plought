<script lang="ts">
	import { dev } from "$app/environment";
	import "./app.css";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });

	let { children } = $props();
</script>

<div
	class="mx-auto flex min-h-dvh max-w-5xl flex-col selection:bg-primary selection:text-primary-foreground"
>
	<main class="p-4">
		{@render children()}
	</main>
</div>
