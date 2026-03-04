<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Criteria from "$lib/components/criteria/Criteria.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Criteria" />
<Criteria
	weights={false}
	method={null}
	tableView={false}
	onChange={() => markSetupStepUsed("criteria")}
/>
