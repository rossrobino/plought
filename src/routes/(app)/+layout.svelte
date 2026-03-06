<script lang="ts">
	import { page } from "$app/state";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import Head from "$lib/components/head.svelte";
	import HeaderFlowNav from "$lib/components/header-flow-nav.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { apps, info } from "$lib/info";
	import { decision, decisionDefaults } from "$lib/state";

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
	};

	const path = $derived.by(() => {
		const pathname = page.url.pathname;
		const next = pathname.indexOf("/", 1);
		return next === -1 ? pathname : pathname.slice(0, next);
	});
	const app = $derived(apps.find((item) => item.path === path));

	const pageTitle = $derived.by(() => {
		if (page.status === 404) {
			return "Not found";
		}

		if (page.status >= 400) {
			return page.error?.message ?? "Error";
		}

		const pathname = page.url.pathname;
		for (const [route, title] of Object.entries(pageTitleMap)) {
			if (pathname.startsWith(route)) {
				return title;
			}
		}
		return app ? app.title : info.name;
	});

	const decisionTitle = $derived.by(() => {
		const value = decision.current.title?.trim() ?? "";
		return value.length ? value : decisionDefaults.title;
	});

	const title = $derived.by(() => {
		if (page.status >= 400) {
			return pageTitle;
		}

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

{#if app && page.status < 400}
	<Head title={app.title} desc={app.desc} />
{/if}

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
		<main
			id="main-content"
			tabindex="-1"
			class="flex w-full min-w-0 flex-1 flex-col px-4 pt-0 pb-4"
		>
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
