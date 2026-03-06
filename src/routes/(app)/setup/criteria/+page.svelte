<script lang="ts">
	import SetupSuggestionPanel from "$lib/components/ai/setup-suggestion-panel.svelte";
	import Criteria from "$lib/components/criteria/criteria.svelte";
	import Head from "$lib/components/head.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Criteria" />
<div class="grid gap-4">
	<Criteria
		weights={false}
		method={null}
		tableView={false}
		onChange={() => markSetupStepUsed("criteria")}
	/>
	<SetupSuggestionPanel
		kind="criteria"
		onApply={() => markSetupStepUsed("criteria")}
	/>
</div>
