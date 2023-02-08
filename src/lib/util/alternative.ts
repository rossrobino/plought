import { criteria, alternatives } from "$lib/stores";
import { get } from "svelte/store";

export const addAlternative = () => {
	const scores: number[] = new Array(get(criteria).length).fill(0);
	alternatives.update((a) => a.concat({ name: "Alternative", scores }));
};

export const removeAlternative = (index: number) => {
	const copy = [...get(alternatives)];
	copy.splice(index, 1);
	alternatives.set(copy);
};

/**
 * Takes the weights of each criteria and the scores of an alternative,
 * multiplies them together, and sums the list, returns total score
 *
 * @param alt - an alternative
 */
export const getWeightedSum = (alt: Alternative): number => {
	const weights = get(criteria).map(({ weight }) => {
		return weight;
	});
	const weighted = [];
	for (let i = 0; i < weights.length; i++) {
		weighted.push(weights[i] * alt.scores[i]);
	}
	const total = weighted.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0,
	);
	return Number(total.toFixed(2));
};
