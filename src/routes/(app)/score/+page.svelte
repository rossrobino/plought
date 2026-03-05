<script lang="ts">
	import Alternatives from "$lib/components/alternatives/alternatives.svelte";
	import { markAppUsed } from "$lib/state";
</script>

<Alternatives
	showCriteria={true}
	editNames={false}
	manageList={false}
	onChange={() => markAppUsed("score")}
/>
