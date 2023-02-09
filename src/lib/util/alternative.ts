import { criteria, alternatives } from "$lib/stores";
import { get } from "svelte/store";

export const addAlternative = () => {
	const scores: number[] = new Array(get(criteria).length).fill(0);
	const pairwise: number[] = new Array(get(alternatives).length + 1).fill(0.5);
	const copy = [...get(alternatives)];
	copy.forEach((alt) => {
		alt.pairwise.push(0.5);
	});
	alternatives.update(() =>
		copy.concat({
			name: `Alternative #${get(alternatives).length + 1}`,
			scores,
			pairwise,
		}),
	);
};

export const removeAlternative = (index: number) => {
	const copy = [...get(alternatives)];
	copy.splice(index, 1);
	copy.forEach((alt) => {
		alt.pairwise.splice(index, 1);
	});
	alternatives.set(copy);
};

/**
 * Takes the weights of each criteria and the scores of an alternative,
 * multiplies them together, and sums the list, returns total score
 *
 * @param alt - alternative
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

/**
 * Takes an alternative,
 * finds the index of the alternative,
 * sums all the pairwise scores besides the index
 *
 * @param alt - alternative
 * @returns pairwise score
 */
export const getPairwiseScore = (alt: Alternative) => {
	const skipIndex = get(alternatives).indexOf(alt);
	let total = 0;
	alt.pairwise.forEach((score, i) => {
		if (i !== skipIndex) {
			total += score;
		}
	});
	return total;
};
