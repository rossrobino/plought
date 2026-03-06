<script lang="ts">
	import Alternatives from "$lib/components/alternatives/alternatives.svelte";
	import Head from "$lib/components/head.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Alternatives" />
<Alternatives onChange={() => markSetupStepUsed("alternatives")} />
