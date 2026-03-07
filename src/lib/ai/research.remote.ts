import { query } from "$app/server";
import { client } from "$lib/ai";
import { error } from "@sveltejs/kit";

export const generateScoreResearch = query(
	client.scoreResearchSchema,
	async (input) => {
		if (!client.canScore(input)) {
			error(
				400,
				"Choose a named alternative and criterion before asking for score research.",
			);
		}

		return client.createScoreResearch(input);
	},
);

export const generateAllocateResearch = query(
	client.allocateResearchSchema,
	async (input) => {
		if (!client.canAllocate(input)) {
			error(
				400,
				"Name the current criterion and at least two alternatives before asking for allocation research.",
			);
		}

		return client.createAllocateResearch(input);
	},
);
