<script lang="ts">
	import { apps } from "$lib/info";
</script>

<h1 class="">Reduce Noise in Decision Making</h1>

<h2>Applications</h2>
<div class="grid gap-4 sm:grid-cols-2">
	{#each apps as app}
		<div class="rounded bg-stone-200 p-4">
			<a class="text-xl capitalize" href={app.path}>
				{app.title}
			</a>
			<p>{app.desc}</p>
		</div>
	{/each}
	<div class="rounded bg-stone-200 p-4">
		Plought is a work in progress, more tools coming soon!
	</div>
</div>
