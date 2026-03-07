<script lang="ts">
	import Criteria from "$lib/components/criteria/criteria.svelte";
	import { markAppUsed } from "$lib/state";
</script>

<Criteria
	editNames={false}
	manageList={false}
	tableView={false}
	onChange={() => markAppUsed("weigh")}
/>
