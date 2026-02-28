<script lang="ts">
	import { page } from "$app/state";
	import { info } from "$lib/info";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import HomeIcon from "@lucide/svelte/icons/home";
	import ScaleIcon from "@lucide/svelte/icons/scale";

	const overview = [{ icon: HomeIcon, href: "/", label: "Home" }];

	const apps = [
		{ icon: ScaleIcon, href: "/weighted-sum", label: "Weighted Sum" },
		{
			icon: GitCompareIcon,
			href: "/pairwise-comparison",
			label: "Pairwise Comparison",
		},
	];

	const summary = [{ icon: BarChart3Icon, href: "/scores", label: "Scores" }];

	const active = (href: string) => {
		if (href === "/") {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	};
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header class="p-3">
		<a
			href="/"
			class="flex items-center gap-2 rounded-md p-2 text-sidebar-foreground no-underline transition-colors hover:bg-sidebar-accent"
		>
			<img src="/plought-text-logo-dark.svg" alt={info.name} class="h-6 w-auto" />
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each overview as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={active(item.href)} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a {...props} href={item.href}>
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
					{#each apps as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={active(item.href)} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a {...props} href={item.href}>
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
			<Sidebar.GroupLabel>Summary</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each summary as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={active(item.href)} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a {...props} href={item.href}>
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
</Sidebar.Root>
