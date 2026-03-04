<script lang="ts">
	import { dev } from "$app/environment";
	import { page } from "$app/state";
	import AppSidebar from "$lib/components/AppSidebar.svelte";
	import HeaderFlowNav from "$lib/components/HeaderFlowNav.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { apps, info } from "$lib/info";
	import { decision, decisionDefaults } from "$lib/state";
	import "./app.css";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";

	if (!dev) {
		injectAnalytics({ mode: "production" });
	}

	let open = $state(true);
	let { children } = $props();
	type FlowLink = { href: string; label: string };
	const flow: FlowLink[] = [
		{ href: "/setup", label: "Start" },
		{ href: "/setup/alternatives", label: "Alternatives" },
		{ href: "/setup/criteria", label: "Criteria" },
		{ href: "/weigh", label: "Weigh" },
		{ href: "/score", label: "Score" },
		{ href: "/compare", label: "Compare" },
		{ href: "/rank", label: "Rank" },
		{ href: "/allocate", label: "Allocate" },
	];

	const pageTitle = $derived.by(() => {
		if (page.url.pathname === "/") {
			return "Home";
		}
		if (page.url.pathname === "/setup") {
			return "Start";
		}
		if (page.url.pathname.startsWith("/setup/alternatives")) {
			return "Alternatives";
		}
		if (page.url.pathname.startsWith("/setup/criteria")) {
			return "Criteria";
		}
		if (page.url.pathname.startsWith("/analysis/weight")) {
			return "Weighted Sum";
		}
		if (page.url.pathname.startsWith("/analysis/compare")) {
			return "Pairwise Comparison";
		}
		if (page.url.pathname.startsWith("/analysis/rank")) {
			return "Rank Order";
		}
		if (page.url.pathname.startsWith("/analysis/allocate")) {
			return "Point Allocation";
		}
		if (page.url.pathname.startsWith("/analysis/topsis")) {
			return "TOPSIS";
		}
		if (page.url.pathname.startsWith("/analysis/robustness")) {
			return "Robustness";
		}
		if (page.url.pathname.startsWith("/analysis")) {
			return "Summary";
		}
		const app = apps.find((item) => page.url.pathname.startsWith(item.path));
		return app ? app.title : info.name;
	});

	const decisionTitle = $derived.by(() => {
		const value = decision.current.title?.trim() ?? "";
		return value.length ? value : decisionDefaults.title;
	});

	const title = $derived.by(() => {
		return `${decisionTitle} · ${pageTitle}`;
	});

	const flowNav = $derived.by(() => {
		const i = flow.findIndex((item) => item.href === page.url.pathname);
		if (i === -1) {
			return null;
		}
		return {
			prev: flow[i - 1] ?? null,
			next:
				flow[i + 1] ??
				(flow[i]?.href === "/allocate"
					? { href: "/analysis", label: "Summary" }
					: null),
		};
	});
</script>

<Sidebar.Provider bind:open class="min-w-[18rem]">
	<AppSidebar />
	<Sidebar.Inset class="selection:bg-foreground selection:text-background">
		<header
			class="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80"
		>
			<Sidebar.Trigger />
			<div class="min-w-0 truncate text-base font-semibold">{title}</div>
			{#if flowNav != null}
				<HeaderFlowNav prev={flowNav.prev} next={flowNav.next} />
			{/if}
		</header>
		<div class="flex w-full min-w-0 flex-1 flex-col px-4 pt-0 pb-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
