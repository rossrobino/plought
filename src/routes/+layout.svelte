<script lang="ts">
	import { dev } from "$app/environment";
	import { page } from "$app/state";
	import AppSidebar from "$lib/components/AppSidebar.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { apps, info } from "$lib/info";
	import "./app.css";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });

	let open = $state(true);
	let { children } = $props();

	const title = $derived.by(() => {
		if (page.url.pathname === "/") {
			return "Home";
		}
		if (page.url.pathname.startsWith("/scores")) {
			return "Scores";
		}
		const app = apps.find((item) => page.url.pathname.startsWith(item.path));
		return app ? app.title : info.name;
	});
</script>

<Sidebar.Provider bind:open>
	<AppSidebar />
	<Sidebar.Inset class="selection:bg-primary selection:text-primary-foreground">
		<header
			class="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80"
		>
			<Sidebar.Trigger />
			<div class="min-w-0 truncate text-base font-semibold">{title}</div>
		</header>
		<div class="flex w-full flex-1 flex-col px-3 pt-0 pb-3">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
