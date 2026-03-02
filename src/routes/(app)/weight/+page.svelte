<script lang="ts">
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import Criteria from "$lib/components/criteria/Criteria.svelte";
</script>

<Criteria editNames={false} manageList={false} />
<Alternatives showCriteria={true} editNames={false} manageList={false} />
