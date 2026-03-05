<script lang="ts">
	import { dev } from "$app/environment";
	import { page } from "$app/state";
	import faviconDark from "$lib/assets/favicon-dark.png";
	import faviconLight from "$lib/assets/favicon-light.png";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import HeaderFlowNav from "$lib/components/header-flow-nav.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { apps, info } from "$lib/info";
	import { decision, decisionDefaults } from "$lib/state";
	import "./app.css";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";

	if (!dev) injectAnalytics({ mode: "production" });

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
	const flowIndex = new Map(
		flow.map((item, index) => [item.href, index] as const),
	);
	const pageTitleMap = {
		"/setup/alternatives": "Alternatives",
		"/setup/criteria": "Criteria",
		"/analysis/weight": "Weighted Sum",
		"/analysis/compare": "Pairwise Comparison",
		"/analysis/rank": "Rank Order",
		"/analysis/allocate": "Point Allocation",
		"/analysis/topsis": "TOPSIS",
		"/analysis/robustness": "Robustness",
		"/analysis": "Summary",
		"/setup": "Start",
		"/": "Home",
	};

	const pageTitle = $derived.by(() => {
		const path = page.url.pathname;
		for (const [route, title] of Object.entries(pageTitleMap)) {
			if (route === "/") {
				if (path === "/") {
					return title;
				}
				continue;
			}
			if (path.startsWith(route)) {
				return title;
			}
		}
		const app = apps.find((item) => path.startsWith(item.path));
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
		const i = flowIndex.get(page.url.pathname);
		if (i == null) {
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

<svelte:head>
	<link href={faviconLight} rel="icon" media="(prefers-color-scheme: dark)" />
	<link href={faviconDark} rel="icon" media="(prefers-color-scheme: light)" />
</svelte:head>

<Sidebar.Provider bind:open class="min-w-[18rem]">
	<AppSidebar />
	<Sidebar.Inset class="selection:bg-foreground selection:text-background">
		<header
			class="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80"
		>
			<Sidebar.Trigger />
			<h1 class="m-0 min-w-0 truncate text-base font-semibold">{title}</h1>
			{#if flowNav != null}
				<HeaderFlowNav prev={flowNav.prev} next={flowNav.next} />
			{/if}
		</header>
		<div class="flex w-full min-w-0 flex-1 flex-col px-4 pt-0 pb-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
