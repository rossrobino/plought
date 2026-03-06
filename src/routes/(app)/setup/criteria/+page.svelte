<script lang="ts">
	import Criteria from "$lib/components/criteria/criteria.svelte";
	import Head from "$lib/components/head.svelte";
	import { markSetupStepUsed } from "$lib/state";
</script>

<Head title="Criteria" />
<Criteria
	weights={false}
	method={null}
	tableView={false}
	onChange={() => markSetupStepUsed("criteria")}
/>
