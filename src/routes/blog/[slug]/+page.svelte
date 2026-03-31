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

<Head title={data.post.title} desc={data.post.description} />

<main
	id="main-content"
	tabindex="-1"
	class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14"
>
	<div class="space-y-8">
		<header class="space-y-5">
			<div class="space-y-3">
				<a href="/blog" class="inline-flex items-center gap-2 text-sm">
					Back to blog
				</a>
				<p
					class="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase"
				>
					{info.name}
				</p>
			</div>

			<div class="space-y-4">
				<h1
					class="text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl"
				>
					{data.post.title}
				</h1>
				<p class="max-w-2xl text-base leading-7 text-muted-foreground italic">
					{data.post.description}
				</p>
				<p class="text-sm text-muted-foreground">
					<time datetime={data.post.date}>
						{date.format(new Date(`${data.post.date}T00:00:00Z`))}
					</time>
					<span aria-hidden="true">·</span>
					<span>{data.post.author}</span>
				</p>
			</div>
		</header>

		<article class="blog-body">
			{@html data.post.html}
		</article>
	</div>
</main>

<style>
	.blog-body {
		font-size: 1rem;
		line-height: 1.8;
	}

	.blog-body :global(h2),
	.blog-body :global(h3) {
		margin-block: 2.5rem 0.75rem;
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 1.15;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	.blog-body :global(h3) {
		font-size: 1.2rem;
	}

	.blog-body :global(p),
	.blog-body :global(ul),
	.blog-body :global(ol),
	.blog-body :global(blockquote),
	.blog-body :global(pre) {
		margin-block: 1rem;
	}

	.blog-body :global(ul),
	.blog-body :global(ol) {
		padding-inline-start: 1.25rem;
	}

	.blog-body :global(ul) {
		list-style: disc;
	}

	.blog-body :global(ol) {
		list-style: decimal;
	}

	.blog-body :global(li + li) {
		margin-block-start: 0.4rem;
	}

	.blog-body :global(blockquote) {
		border-inline-start: 3px solid var(--color-border);
		padding-inline-start: 1rem;
		color: var(--color-muted-foreground);
	}

	.blog-body :global(code) {
		border: 1px solid var(--color-border);
		border-radius: calc(var(--radius) + 0.125rem);
		background: color-mix(in oklch, var(--color-muted) 70%, transparent);
		padding-inline: 0.35rem;
		padding-block: 0.12rem;
		font-size: 0.92em;
	}

	.blog-body :global(pre) {
		border: 1px solid var(--color-border);
		border-radius: calc(var(--radius) + 0.25rem);
		background: color-mix(in oklch, var(--color-muted) 70%, transparent);
		padding: 1rem;
		overflow-x: auto;
	}

	.blog-body :global(pre code) {
		border: 0;
		background: transparent;
		padding: 0;
	}

	.blog-body :global(:first-child) {
		margin-block-start: 0;
	}

	.blog-body :global(:last-child) {
		margin-block-end: 0;
	}
</style>
