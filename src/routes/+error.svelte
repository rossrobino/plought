<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { Button } from "$lib/components/ui/button";
	import { info } from "$lib/info";

	const miss = $derived(page.status === 404);
	const title = $derived(miss ? "404 not found" : "Something went wrong");
	const lead = $derived(miss ? title : "This view failed while loading.");
	const note = $derived(
		miss
			? "Try going back or return to the homepage."
			: "Return to a known route and try again.",
	);
	const detail = $derived(
		page.error?.message ?? (miss ? "Not found" : "Unknown error"),
	);

	const back = async () => {
		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		await goto("/");
	};
</script>

<svelte:head>
	<title>{title} | {info.name}</title>
	<meta name="description" content={lead} />
	<meta name="robots" content="noindex" />
</svelte:head>

<section>
	<div class="grid gap-4">
		<div
			class="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase"
		>
			<span class="size-2 rounded-full bg-destructive"></span>
			{miss ? "Not found" : "Request error"}
		</div>

		<div class="space-y-3">
			<h2
				class="mb-0 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl"
			>
				{title}
			</h2>
			<p class="mb-0 max-w-2xl text-base text-muted-foreground sm:text-lg">
				{note}
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
			<div class="rounded-xl border bg-background p-4 shadow-xs">
				<p class="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
					Requested path
				</p>
				<p class="mb-0 overflow-x-auto font-mono text-sm text-foreground">
					{page.url.pathname}
				</p>
			</div>
			<div class="rounded-xl border bg-background p-4 shadow-xs">
				<p class="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
					Status message
				</p>
				<p class="mb-0 text-sm text-foreground">{detail}</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-3">
			<Button size="sm" onclick={back}>Go back</Button>
			<Button href="/" size="sm" variant="outline">Go home</Button>
		</div>
	</div>
</section>
