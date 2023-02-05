import { persisted } from "svelte-local-storage-store";

export const categories = persisted("categories", [
	{
		name: "Category #1",
		weight: 0.5,
	},
	{
		name: "Category #2",
		weight: 0.5,
	},
]);

export const items = persisted("items", [
	{
		name: "Item #1",
		scores: [5, 5],
	},
	{
		name: "Item #2",
		scores: [5, 5],
	},
]);
