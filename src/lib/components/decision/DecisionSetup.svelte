<script lang="ts">
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { decision, decisionDefaults } from "$lib/state";
</script>

<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
	<h2 class="mb-0">Start</h2>
	<p class="mt-1 text-sm text-muted-foreground">
		Define what you are deciding and what success looks like. You can update
		this anytime.
	</p>
	<div class="mt-3 grid gap-3 sm:grid-cols-2">
		<Field.Field>
			<Field.Label for="decision-title">Title</Field.Label>
			<Input
				type="text"
				id="decision-title"
				name="decision-title"
				bind:value={decision.current.title}
				placeholder={decisionDefaults.title}
			/>
			<Field.Description>
				A short name for this decision, like “Choose a car” or “Pick a city”.
			</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="decision-goal">Goal</Field.Label>
			<Input
				type="text"
				id="decision-goal"
				name="decision-goal"
				bind:value={decision.current.goal}
				placeholder={decisionDefaults.goal}
			/>
			<Field.Description>
				Describe what outcome you want, so criteria and method results stay
				aligned.
			</Field.Description>
		</Field.Field>
	</div>
</div>
