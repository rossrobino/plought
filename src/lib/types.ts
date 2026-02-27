export interface Alternative {
	name: string;
	scores: number[];
	pairwise: number[];
}

export interface Criteria {
	name: string;
	weight: number;
}
