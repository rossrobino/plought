<script lang="ts">
	import "../app.postcss";

	export let data;
</script>

<div
	class="flex h-[100dvh] flex-col justify-between selection:bg-content selection:text-base"
>
	<div>
		<main class="max-w-full p-4">
			<slot />
		</main>
	</div>
	<footer
		class="mt-8 flex max-w-full items-center justify-between p-4 text-content"
	>
		<div class="flex gap-1">
			{#await data.contributors}
				loading...
			{:then contributors}
				{#each contributors as { login, html_url }}
					<a href={html_url} aria-label="{login}'s GitHub">
						<img
							src="https://github.com/{login}.png"
							class="h-8 rounded-full"
							alt={login}
						/>
					</a>
				{/each}
			{/await}
		</div>
		<a href="/">
			<img src="/plought-text-logo-dark.svg" alt="Plought" class="w-24" />
		</a>
	</footer>
</div>
