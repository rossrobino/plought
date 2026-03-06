<script lang="ts">
	import SetupSuggestionPanel from "$lib/components/ai/setup-suggestion-panel.svelte";
	import Alternatives from "$lib/components/alternatives/alternatives.svelte";
	import Head from "$lib/components/head.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Alternatives" />
<div class="grid gap-4">
	<Alternatives onChange={() => markSetupStepUsed("alternatives")} />
	<SetupSuggestionPanel
		kind="alternatives"
		onApply={() => markSetupStepUsed("alternatives")}
	/>
</div>
