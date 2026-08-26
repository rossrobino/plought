<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import Head from "$lib/components/head.svelte";
	import HeaderFlowNav from "$lib/components/header-flow-nav.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { apps, info } from "$lib/info";
	import { decision } from "$lib/state";
	import { onMount } from "svelte";

	let open = $state(true);
	let { children } = $props();

	onMount(() => {
		const context = document.modelContext;
		if (context == null) {
			return;
		}

		let disposed = false;
		let cleanup: (() => void) | null = null;
		void import("$lib/webmcp")
			.then(({ registerPloughtTools }) => {
				const next = registerPloughtTools(context, goto);
				if (disposed) {
					next();
					return;
				}
				cleanup = next;
			})
			.catch((error: unknown) => {
				console.error("Could not register Plought site tools", error);
			});

		return () => {
			disposed = true;
			cleanup?.();
		};
	});

	type FlowLink = { href: string; label: string };
	const flow: FlowLink[] = [
		{ href: "/setup", label: "Start" },
		{ href: "/setup/alternatives", label: "Alternatives" },
		{ href: "/setup/criteria", label: "Criteria" },
		{ href: "/weigh", label: "Weigh" },
		{ href: "/score", label: "Score" },
		{ href: "/compare", label: "Compare" },
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
		return decision.current.title?.trim() ?? "";
	});

	const title = $derived.by(() => {
		if (page.status >= 400) {
			return pageTitle;
		}

		return decisionTitle.length > 0
			? `${decisionTitle} · ${pageTitle}`
			: pageTitle;
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

<a href="#main-content" class="skip-link">Skip to main content</a>

<Sidebar.Provider bind:open class="min-w-[18rem]">
	<AppSidebar />
	<Sidebar.Inset class="selection:bg-foreground selection:text-background">
		<header
			class="sticky top-0 z-20 flex h-15 items-center gap-2 border-b border-border/60 bg-background/88 px-3 backdrop-blur-xl supports-backdrop-filter:bg-background/78 md:px-4"
		>
			<Sidebar.Trigger />
			<div class="mx-1 h-5 w-px bg-border/70" aria-hidden="true"></div>
			<h1
				class="m-0 min-w-0 truncate text-sm font-semibold tracking-tight sm:text-base"
			>
				{title}
			</h1>
			{#if flowNav != null}
				<HeaderFlowNav prev={flowNav.prev} next={flowNav.next} />
			{/if}
		</header>
		<main
			id="main-content"
			tabindex="-1"
			class="flex w-full min-w-0 flex-1 flex-col px-4 pt-0 pb-5 sm:px-5 md:px-6"
		>
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
