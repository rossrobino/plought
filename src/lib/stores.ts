import { persisted } from "svelte-local-storage-store";

export const criteria = persisted("criteria", [
	{
		name: "Criteria #1",
		weight: 0.5,
	},
	{
		name: "Criteria #2",
		weight: 0.5,
	},
]);

export const alternatives = persisted("alternatives", [
	{
		name: "Alternative #1",
		scores: [5, 5],
		pairwise: [0.5, 0.5],
	},
	{
		name: "Alternative #2",
		scores: [5, 5],
		pairwise: [0.5, 0.5],
	},
]);
