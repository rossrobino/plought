<script lang="ts">
	import { page } from "$app/state";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { info } from "$lib/info";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import GithubIcon from "@lucide/svelte/icons/github";
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
			class="flex items-center gap-2 rounded-md p-2 text-sidebar-foreground no-underline transition-colors hover:bg-transparent"
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
					{#each overview as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
								class="hover:bg-transparent hover:text-sidebar-foreground data-[state=open]:hover:bg-transparent data-[state=open]:hover:text-sidebar-foreground"
							>
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
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
							>
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
							<Sidebar.MenuButton
								isActive={active(item.href)}
								tooltipContent={item.label}
							>
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
	<Sidebar.Footer>
		<Sidebar.Separator />
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent="GitHub Repository">
					{#snippet child({ props })}
						<a
							{...props}
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
