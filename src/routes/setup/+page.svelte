<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Reset from "$lib/components/Reset.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import DecisionSetup from "$lib/components/decision/DecisionSetup.svelte";
</script>

<Head title="Setup" />

<div class="mt-4">
	<DecisionSetup />
</div>

<Alternatives />

<Reset />
