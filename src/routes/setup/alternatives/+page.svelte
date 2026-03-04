<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Alternatives" />
<Alternatives onChange={() => markSetupStepUsed("alternatives")} />
