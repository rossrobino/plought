<script lang="ts">
	import "../app.postcss";
	import { info } from "../lib/info";
</script>

<div
	class="flex h-[100dvh] flex-col justify-between selection:bg-p selection:text-slate-900"
>
	<div>
		<header class="bg-slate-900 p-4 text-slate-50">
			<a class="no-underline" href="/">
				<h2 class="text-3xl font-bold capitalize">
					<img src="plought-text-logo-light.svg" alt="Plought logo" class="w-48" />
				</h2>
			</a>
		</header>
		<main
			class="prose prose-slate max-w-full p-4 prose-h1:text-slate-800 prose-a:font-semibold prose-a:decoration-rose-700 prose-a:underline-offset-2 hover:prose-a:brightness-95"
		>
			<slot />
		</main>
	</div>
	<footer
		class="prose prose-slate max-w-full bg-slate-900 p-4 font-bold text-slate-50 prose-a:font-semibold prose-a:text-slate-100 prose-a:decoration-rose-700"
	>
		<a href={info.github}>GitHub</a>
	</footer>
</div>
