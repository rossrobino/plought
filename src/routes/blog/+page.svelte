<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import { info } from "$lib/info";
	import type { PageData } from "./$types";

	const date = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeZone: "UTC",
	});

	let { data }: { data: PageData } = $props();
</script>

<Head
	title="Blog"
	desc="Notes on structured decision making, ranking methods, and practical evaluation workflows."
/>

<main
	id="main-content"
	tabindex="-1"
	class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14"
>
	<div class="space-y-8">
		<header class="space-y-4">
			<div class="space-y-2">
				<p
					class="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase"
				>
					{info.name}
				</p>
				<h1
					class="text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl"
				>
					Blog
				</h1>
			</div>
			<p class="max-w-2xl text-base leading-7 text-muted-foreground">
				Short essays on structured decision making, tradeoff analysis, and
				practical ranking workflows.
			</p>
		</header>

		{#if data.posts.length === 0}
			<section class="space-y-2">
				<h2>No posts yet</h2>
				<p class="text-sm text-muted-foreground">
					Add a markdown file in <code>src/content/blog</code>
					to publish the first post.
				</p>
			</section>
		{:else}
			<div class="space-y-4">
				{#each data.posts as post}
					<article class="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
						<div class="space-y-3">
							<p class="text-sm text-muted-foreground">
								<time datetime={post.date}>
									{date.format(new Date(`${post.date}T00:00:00Z`))}
								</time>
								<span aria-hidden="true">·</span>
								<span>{post.author}</span>
							</p>
							<div class="space-y-2">
								<h2 class="text-2xl font-semibold tracking-tight">
									<a
										href={`/blog/${post.slug}`}
										class="no-underline hover:underline"
									>
										{post.title}
									</a>
								</h2>
								<p class="text-sm leading-6 text-muted-foreground italic">
									{post.description}
								</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}

		<footer>
			<a href="/" class="inline-flex items-center gap-2 text-sm">
				Back to home
			</a>
		</footer>
	</div>
</main>
