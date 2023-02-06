<script lang="ts">
	import "../app.postcss";
	import { info } from "../lib/info";
</script>

<div
	class="flex h-[100dvh] flex-col justify-between selection:bg-rose-800 selection:text-stone-100">
	<div>
		<header class="bg-stone-900 p-4 text-stone-50">
			<a class="no-underline" href="/">
				<h2 class="text-3xl font-bold capitalize">{info.name}</h2>
			</a>
		</header>
		<main
			class="prose prose-stone max-w-full p-4 prose-h1:text-indigo-900 prose-a:font-semibold prose-a:decoration-rose-800">
			<slot />
		</main>
	</div>
	<footer
		class="prose prose-stone max-w-full bg-stone-900 p-4 font-bold text-stone-50 prose-a:font-semibold prose-a:text-stone-100 prose-a:decoration-rose-800">
		<a href={info.github}>GitHub</a>
	</footer>
</div>
