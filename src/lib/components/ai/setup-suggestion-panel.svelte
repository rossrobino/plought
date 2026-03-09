<script lang="ts">
	import {
		generateAlternativeSuggestions,
		generateCriteriaSuggestions,
	} from "$lib/ai/suggestions.remote";
	import type {
		AlternativeSuggestionRequest,
		CriteriaSuggestionRequest,
	} from "$lib/ai/types";
	import SetupSuggestionResults from "$lib/components/ai/setup-suggestion-results.svelte";
	import { Button } from "$lib/components/ui/button";
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import {
		alternatives,
		criteria,
		decision,
		decisionDefaults,
		insertAlternativeSuggestions,
		insertCriteriaSuggestions,
	} from "$lib/state";

	type Kind = "alternatives" | "criteria";
	type Request = AlternativeSuggestionRequest | CriteriaSuggestionRequest;
	type Props = { kind: Kind; onApply?: () => void };

	let { kind, onApply }: Props = $props();

	let request = $state<Request | null>(null);
	const alternativePattern = /^Alternative #\d+$/i;
	const criteriaPattern = /^Criterion #\d+$/i;

	const currentAlternatives = $derived(
		alternatives.current.map((item) => item.name),
	);
	const currentCriteria = $derived(criteria.current.map((item) => item.name));
	const canGenerate = $derived.by(() => {
		const collapse = (value: string) => {
			return value.trim().replace(/\s+/g, " ");
		};
		const dedupe = (values: string[]) => {
			const seen = new Set<string>();
			const next = [];

			for (const value of values) {
				const current = collapse(value);
				const key = current.toLocaleLowerCase();
				if (!current || seen.has(key)) {
					continue;
				}
				seen.add(key);
				next.push(current);
			}

			return next;
		};
		const filter = (values: string[], pattern: RegExp) => {
			return dedupe(values).filter((value) => !pattern.test(value));
		};
		const title = collapse(decision.current.title);
		const goal = collapse(decision.current.goal);

		return (
			(title.length > 0 && title !== decisionDefaults.title) ||
			(goal.length > 0 && goal !== decisionDefaults.goal) ||
			collapse(decision.current.notes).length > 0 ||
			filter(currentAlternatives, alternativePattern).length > 0 ||
			(kind === "criteria"
				? filter(currentCriteria, criteriaPattern).length > 0
				: false)
		);
	});
	const message = $derived(
		kind === "alternatives"
			? "Add a title, goal, preferences, or real alternatives first."
			: "Add a title, goal, preferences, or real decision details first.",
	);
	const title = $derived(
		kind === "alternatives"
			? "Need more alternatives?"
			: "Need help drafting criteria?",
	);
	const desc = $derived(
		kind === "alternatives"
			? "Use your start details and current list to brainstorm more options."
			: "Use your start details and current list to draft factors to compare.",
	);

	const createRequest = (): Request => {
		if (kind === "alternatives") {
			return {
				title: decision.current.title,
				goal: decision.current.goal,
				notes: decision.current.notes,
				existingAlternatives: [...currentAlternatives],
				requestId: crypto.randomUUID(),
			};
		}

		return {
			title: decision.current.title,
			goal: decision.current.goal,
			notes: decision.current.notes,
			existingAlternatives: [...currentAlternatives],
			existingCriteria: [...currentCriteria],
			requestId: crypto.randomUUID(),
		};
	};

	const generate = () => {
		request = createRequest();
	};

	const addOne = (name: string) => {
		const added =
			kind === "alternatives"
				? insertAlternativeSuggestions([name])
				: insertCriteriaSuggestions([name]);
		if (added.length > 0) {
			onApply?.();
		}
	};

	const addAll = (names: string[]) => {
		const added =
			kind === "alternatives"
				? insertAlternativeSuggestions(names)
				: insertCriteriaSuggestions(names);
		if (added.length > 0) {
			onApply?.();
		}
	};

	const loadSuggestions = (input: Request) => {
		if ("existingCriteria" in input) {
			return generateCriteriaSuggestions(input);
		}

		return generateAlternativeSuggestions(input);
	};

	const getErrorMessage = (value: unknown) => {
		return value instanceof Error
			? value.message
			: "Suggestions could not be generated right now.";
	};
</script>

<section class="rounded-lg border bg-muted/10 p-3 shadow-xs">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<h2 class="text-base font-medium">{title}</h2>
			<p class="mt-1 text-sm text-muted-foreground">{desc}</p>
		</div>
		<div class="shrink-0">
			<Button
				size="sm"
				variant="outline"
				disabled={!canGenerate}
				onclick={generate}
			>
				Generate
			</Button>
		</div>
	</div>
	{#if !canGenerate}
		<p class="mt-3 text-sm text-muted-foreground">{message}</p>
	{/if}

	{#if request != null}
		{#key request.requestId}
			<svelte:boundary>
				<SetupSuggestionResults
					existing={kind === "alternatives"
						? currentAlternatives
						: currentCriteria}
					{kind}
					onAdd={addOne}
					onAddAll={addAll}
					result={await loadSuggestions(request)}
				/>
				{#snippet pending()}
					<div
						aria-live="polite"
						role="status"
						class="mt-3 rounded-lg border bg-background p-3 shadow-xs"
					>
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<Eyebrow class="mb-2">Summary</Eyebrow>
								<p class="text-sm text-muted-foreground">
									Generating suggestions you can review and add.
								</p>
							</div>
							<div
								class="mt-0.5 size-4 shrink-0 rounded-full border-2 border-muted border-t-foreground/70 motion-safe:animate-spin"
							></div>
						</div>

						<div class="mt-4 grid gap-2">
							{#each [1, 2, 3, 4] as item (item)}
								<div class="rounded-lg border bg-muted/10 p-3">
									<Skeleton class="h-4 w-36" />
									<div class="mt-2 space-y-2">
										<Skeleton class="h-3 w-full bg-muted/45" />
										<Skeleton class="h-3 w-4/5 bg-muted/45" />
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/snippet}
				{#snippet failed(error, reset)}
					<div
						class="mt-3 rounded-lg border border-destructive/30 bg-background p-3 shadow-xs"
					>
						<p class="text-sm text-muted-foreground">
							{getErrorMessage(error)}
						</p>
						<div class="mt-3 flex justify-end">
							<Button size="sm" variant="outline" onclick={reset}>
								Try again
							</Button>
						</div>
					</div>
				{/snippet}
			</svelte:boundary>
		{/key}
	{/if}
</section>
