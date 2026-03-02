<script lang="ts">
	import { page } from "$app/state";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { apps as appRegistry, info } from "$lib/info";
	import { methodMeta } from "$lib/state";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import GithubIcon from "@lucide/svelte/icons/github";
	import HomeIcon from "@lucide/svelte/icons/home";
	import ListOrderedIcon from "@lucide/svelte/icons/list-ordered";
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import { mergeProps } from "bits-ui";

	const overview = [
		{ icon: HomeIcon, href: "/", label: "Home" },
		{ icon: SlidersHorizontalIcon, href: "/setup", label: "Setup" },
	];

	const getAppIcon = (path: string) => {
		if (path === "/weighted-sum") {
			return ScaleIcon;
		}
		if (path === "/rank-order") {
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

	const summary = [{ icon: BarChart3Icon, href: "/scores", label: "Scores" }];
	const sidebar = Sidebar.useSidebar();

	const active = (href: string) => {
		if (href === "/") {
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
			<Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each overview as item (item.href)}
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
							{#if methodMeta.current[item.method]?.used}
								<Sidebar.MenuBadge
									class="end-2 h-2 w-2 min-w-0 rounded-full bg-primary p-0 text-transparent peer-data-[size=sm]/menu-button:top-1/2 peer-data-[size=default]/menu-button:top-1/2 peer-data-[size=lg]/menu-button:top-1/2 -translate-y-1/2"
									aria-hidden="true"
								/>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Summary</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each summary as item (item.href)}
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
