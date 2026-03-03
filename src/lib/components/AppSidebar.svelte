<script lang="ts">
	import { page } from "$app/state";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { apps as appRegistry, info } from "$lib/info";
	import { isMethodUsed } from "$lib/state";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import CheckIcon from "@lucide/svelte/icons/check";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import GithubIcon from "@lucide/svelte/icons/github";
	import ListOrderedIcon from "@lucide/svelte/icons/list-ordered";
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import TargetIcon from "@lucide/svelte/icons/target";
	import { mergeProps } from "bits-ui";

	const setup = [
		{ icon: SlidersHorizontalIcon, href: "/setup", label: "Start" },
		{
			icon: ListOrderedIcon,
			href: "/setup/alternatives",
			label: "Alternatives",
		},
		{ icon: ScaleIcon, href: "/setup/criteria", label: "Criteria" },
	];

	const getAppIcon = (path: string) => {
		if (path === "/weight") {
			return ScaleIcon;
		}
		if (path === "/rank") {
			return ListOrderedIcon;
		}
		return GitCompareIcon;
	};

	const apps = appRegistry.map((item) => {
		return {
			...item,
			icon: getAppIcon(item.path),
			href: item.path,
			label: item.title,
		};
	});

	const output = [
		{ icon: BarChart3Icon, href: "/summary", label: "Summary" },
		{ icon: ScaleIcon, href: "/summary/weight", label: "Weighted Sum" },
		{
			icon: GitCompareIcon,
			href: "/summary/compare",
			label: "Pairwise Comparison",
		},
		{ icon: ListOrderedIcon, href: "/summary/rank", label: "Rank Order" },
		{ icon: TargetIcon, href: "/summary/topsis", label: "TOPSIS" },
	];
	const sidebar = Sidebar.useSidebar();

	const active = (href: string) => {
		if (href === "/setup" || href === "/summary") {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	};

	const closeSidebarOnMobile = () => {
		if (sidebar.isMobile) {
			sidebar.setOpenMobile(false);
		}
	};

	const withMobileClose = (props: Record<string, unknown>) => {
		return mergeProps(props, { onclick: closeSidebarOnMobile });
	};
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header class="p-3">
		<a
			href="/"
			class="flex items-center gap-2 rounded-md p-2 text-sidebar-foreground no-underline transition-colors hover:bg-transparent"
			onclick={closeSidebarOnMobile}
		>
			<img
				src="/plought-text-logo-dark.svg"
				alt={info.name}
				class="h-6 w-auto"
			/>
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Setup</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each setup as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a {...withMobileClose(props)} href={item.href}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Apps</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each apps as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a {...withMobileClose(props)} href={item.href}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if isMethodUsed(item.method)}
								<Sidebar.MenuBadge
									class="inset-e-2 top-1/2 h-4 w-4 min-w-0 -translate-y-1/2 rounded-none bg-transparent p-0 text-sidebar-foreground/70 peer-hover/menu-button:text-sidebar-foreground/80 peer-data-[active=true]/menu-button:text-sidebar-foreground peer-data-[size=default]/menu-button:top-1/2 peer-data-[size=lg]/menu-button:top-1/2 peer-data-[size=sm]/menu-button:top-1/2"
									aria-hidden="true"
								>
									<CheckIcon class="size-3" />
								</Sidebar.MenuBadge>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Analysis</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each output as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a {...withMobileClose(props)} href={item.href}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Separator />
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent="GitHub Repository">
					{#snippet child({ props })}
						<a
							{...withMobileClose(props)}
							href="https://github.com/rossrobino/plought"
							target="_blank"
							rel="noreferrer"
						>
							<GithubIcon />
							<span>GitHub</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
