<script lang="ts">
	import { page } from "$app/state";
	import textLogoDark from "$lib/assets/plought-text-logo-dark.svg";
	import textLogoLight from "$lib/assets/plought-text-logo-light.svg";
	import SnapshotActions from "$lib/components/snapshot/snapshot-actions.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { apps as appRegistry, info } from "$lib/info";
	import { type SetupStepKey, isAppUsed, isSetupStepUsed } from "$lib/state";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import CheckIcon from "@lucide/svelte/icons/check";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import GitForkIcon from "@lucide/svelte/icons/git-fork";
	import GithubIcon from "@lucide/svelte/icons/github";
	import HandCoinsIcon from "@lucide/svelte/icons/hand-coins";
	import ListChecksIcon from "@lucide/svelte/icons/list-checks";
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import TargetIcon from "@lucide/svelte/icons/target";
	import { mergeProps } from "bits-ui";

	type SetupItem = {
		icon: typeof FlagIcon;
		href: string;
		label: string;
		step: SetupStepKey;
	};

	const setup = [
		{ icon: FlagIcon, href: "/setup", label: "Start", step: "start" },
		{
			icon: GitForkIcon,
			href: "/setup/alternatives",
			label: "Alternatives",
			step: "alternatives",
		},
		{
			icon: ListChecksIcon,
			href: "/setup/criteria",
			label: "Criteria",
			step: "criteria",
		},
	] satisfies SetupItem[];

	const completedBadgeClass =
		"inset-e-2 top-1/2 h-4 w-4 min-w-0 -translate-y-1/2 rounded-none bg-transparent p-0 text-sidebar-foreground/70 peer-hover/menu-button:text-sidebar-foreground/80 peer-data-[active=true]/menu-button:text-sidebar-foreground peer-data-[size=default]/menu-button:top-1/2 peer-data-[size=lg]/menu-button:top-1/2 peer-data-[size=sm]/menu-button:top-1/2";

	const apps = appRegistry.map((item) => {
		return {
			href: item.path,
			icon: item.icon,
			key: item.key,
			label: item.title,
		};
	});

	const output = [
		{ icon: BarChart3Icon, href: "/analysis", label: "Summary" },
		{ icon: ScaleIcon, href: "/analysis/weight", label: "Weighted Sum" },
		{
			icon: GitCompareIcon,
			href: "/analysis/compare",
			label: "Pairwise Comparison",
		},
		{
			icon: HandCoinsIcon,
			href: "/analysis/allocate",
			label: "Point Allocation",
		},
		{ icon: TargetIcon, href: "/analysis/topsis", label: "TOPSIS" },
		{
			icon: ShieldCheckIcon,
			href: "/analysis/robustness",
			label: "Robustness",
		},
	];
	const sidebar = Sidebar.useSidebar();
	const exactActive = new Set(["/setup", "/analysis"]);
	const path = $derived(page.url.pathname);

	const active = (href: string) => {
		if (exactActive.has(href)) {
			return path === href;
		}
		return path.startsWith(href);
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
			<picture>
				<source media="(prefers-color-scheme: dark)" srcset={textLogoLight} />
				<img src={textLogoDark} alt={info.name} class="h-6 w-auto" />
			</picture>
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
									<a
										{...withMobileClose(props)}
										href={item.href}
										aria-current={active(item.href) ? "page" : undefined}
									>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if isSetupStepUsed(item.step)}
								<Sidebar.MenuBadge
									class={completedBadgeClass}
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
									<a
										{...withMobileClose(props)}
										href={item.href}
										aria-current={active(item.href) ? "page" : undefined}
									>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if isAppUsed(item.key)}
								<Sidebar.MenuBadge
									class={completedBadgeClass}
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
									<a
										{...withMobileClose(props)}
										href={item.href}
										aria-current={active(item.href) ? "page" : undefined}
									>
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

		<Sidebar.Separator />
		<Sidebar.Group>
			<Sidebar.GroupLabel>Data</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<SnapshotActions onAction={closeSidebarOnMobile} />
			</Sidebar.GroupContent>
		</Sidebar.Group>

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
	</Sidebar.Content>
</Sidebar.Root>
