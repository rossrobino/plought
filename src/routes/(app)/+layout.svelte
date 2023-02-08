<script lang="ts">
	import { page } from "$app/stores";
	import Head from "$lib/components/Head.svelte";
	import { apps } from "$lib/info";
	import { alternatives, criteria } from "$lib/stores";

	// ignore the "/about" end of path
	const path = `/${$page.url.pathname.split("/").slice(1, 2)}`;

	// find the app that matches the current path
	const app = apps.find((app) => app.path === path);

	/**
	 * Checks if the number of scores for each item match
	 * the number of criteria.
	 *
	 * If there's more criteria, push a score (0)
	 *
	 * If there's less criteria, pop a score
	 *
	 * @param criteria - list of criteria
	 * @param alternatives - list of alternatives
	 */
	const syncScores = (criteria: Criteria[], alternatives: Alternative[]) => {
		const needed = criteria.length - alternatives[0].scores.length;
		if (needed > -1) {
			alternatives.forEach((alt) => {
				for (let i = 0; i < needed; i++) {
					alt.scores.push(0);
					console.log(alt.scores);
				}
			});
		} else {
			alternatives.forEach((alt) => {
				for (let i = 0; i < Math.abs(needed); i++) {
					alt.scores.pop();
				}
			});
		}
		$alternatives = $alternatives;
	};

	// called any time $criteria or $alternatives change
	$: syncScores($criteria, $alternatives);
</script>

{#if app}
	<Head title={app.title} desc={app.desc} />

	<div class="-mx-4 grid grid-flow-col border-b-4 border-stone-700">
		<a
			class="rounded-tr bg-stone-100 px-4 py-3"
			class:bg-stone-300={$page.url.pathname === app.path}
			href={app.path}
		>
			App
		</a>
		<a
			class="rounded-tl bg-stone-100 px-4 py-3"
			class:bg-stone-300={$page.url.pathname === `${app.path}/about`}
			href="{app.path}/about"
		>
			Learn
		</a>
	</div>

	<slot />

	{#if $page.url.pathname === `${app.path}/about`}
		<div>
			<p><a href={app.path}>Try it out</a></p>
		</div>
	{/if}
{/if}
