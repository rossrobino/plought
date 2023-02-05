<script lang="ts">
	import "../app.postcss";
	import { info } from "../lib/info";
</script>

<div>
	<header class="bg-stone-900 p-4 text-stone-50">
		<h2 class="text-3xl font-bold capitalize">{info.name}</h2>
	</header>
	<main class="prose prose-stone max-w-full p-4">
		<slot />
	</main>
	<footer class="bg-stone-900 p-4 font-bold text-stone-50">
		<a href={info.github}>GitHub</a>
	</footer>
</div>
