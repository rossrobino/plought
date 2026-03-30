import {
	type AppKey,
	type MethodKey,
	type SetupStepKey,
	hasAlternativesContent,
	hasCriteriaContent,
	hasDecisionContent,
} from "$lib/state";
import type { Alternative, Criteria, Decision } from "$lib/types";
import {
	getAgreementLevel,
	getConsensusRank,
	getConsensusScore10,
	getMethodRanks,
	getMethodScores,
} from "$lib/util/analysis";

interface HomeNextStep {
	href: string;
	label: string;
	note: string;
}

interface HomeProgress {
	done: number;
	total: number;
	percent: number;
}

interface HomePreview {
	decisionTitle: string;
	setupProgress: HomeProgress;
	appProgress: HomeProgress;
	alternativesCount: number;
	criteriaCount: number;
	includedMethodsCount: number;
	leaderName: string | null;
	leaderScore: number | null;
	leaderSource: string | null;
	agreementLabel: string | null;
	hasMeaningfulProgress: boolean;
}

export type HomeSetupState = Record<SetupStepKey, boolean>;
export type HomeAppState = Record<AppKey, boolean>;

interface HomePreviewInput {
	decision: Decision;
	criteria: Criteria[];
	alternatives: Alternative[];
	allocation: number[][];
	setupDone: HomeSetupState;
	appUsed: HomeAppState;
	includedMethods: MethodKey[];
}

export const homeSetupItems = [
	{
		href: "/setup",
		key: "start",
		label: "Start",
		note: "Name the decision and define what success looks like.",
	},
	{
		href: "/setup/alternatives",
		key: "alternatives",
		label: "Alternatives",
		note: "List the alternatives you want to compare before scoring anything.",
	},
	{
		href: "/setup/criteria",
		key: "criteria",
		label: "Criteria",
		note: "Capture the criteria that should drive the final choice.",
	},
] as const satisfies ReadonlyArray<{
	href: string;
	key: SetupStepKey;
	label: string;
	note: string;
}>;

const homeAppSteps = [
	{
		href: "/weigh",
		key: "weigh",
		label: "Resume weighing",
		note: "Set how much each criterion should influence the result.",
	},
	{
		href: "/score",
		key: "score",
		label: "Resume scoring",
		note: "Score each alternative against each criterion.",
	},
	{
		href: "/compare",
		key: "compare",
		label: "Resume comparisons",
		note: "Run head-to-head comparisons when absolute scoring feels noisy.",
	},
	{
		href: "/allocate",
		key: "allocate",
		label: "Resume allocation",
		note: "Distribute fixed points to express tradeoffs per criterion.",
	},
] as const satisfies ReadonlyArray<{
	href: string;
	key: AppKey;
	label: string;
	note: string;
}>;

const agreementLabel = {
	high: "High",
	low: "Low",
	medium: "Medium",
	none: null,
} as const;

const round = (value: number) => {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(2));
};

const getProgress = (values: boolean[]): HomeProgress => {
	const total = values.length;
	const done = values.reduce((count, value) => count + (value ? 1 : 0), 0);
	return {
		done,
		total,
		percent: total === 0 ? 0 : Math.round((done / total) * 100),
	};
};

const hasMeaningfulProgress = ({
	decision,
	criteria,
	alternatives,
	setupDone,
	appUsed,
}: Pick<
	HomePreviewInput,
	"decision" | "criteria" | "alternatives" | "setupDone" | "appUsed"
>) => {
	if (
		Object.values(setupDone).some(Boolean) ||
		Object.values(appUsed).some(Boolean)
	) {
		return true;
	}

	return (
		hasDecisionContent(decision) ||
		hasCriteriaContent(criteria) ||
		hasAlternativesContent(alternatives)
	);
};

export const getHomeNextStep = (
	setupDone: HomeSetupState,
	appUsed: HomeAppState,
): HomeNextStep => {
	for (const item of homeSetupItems) {
		if (!setupDone[item.key]) {
			return {
				href: item.href,
				label:
					item.key === "start"
						? "Start setup"
						: `Continue with ${item.label.toLowerCase()}`,
				note: item.note,
			};
		}
	}

	for (const item of homeAppSteps) {
		if (!appUsed[item.key]) {
			return { href: item.href, label: item.label, note: item.note };
		}
	}

	return {
		href: "/analysis",
		label: "Review summary",
		note: "Compare outputs side by side and pressure-test the final pick.",
	};
};

export const getHomePreview = ({
	decision,
	criteria,
	alternatives,
	allocation,
	setupDone,
	appUsed,
	includedMethods,
}: HomePreviewInput): HomePreview => {
	const preview: HomePreview = {
		decisionTitle:
			decision.title.trim().length > 0 ? decision.title : "Untitled decision",
		setupProgress: getProgress(
			homeSetupItems.map((item) => setupDone[item.key]),
		),
		appProgress: getProgress(homeAppSteps.map((item) => appUsed[item.key])),
		alternativesCount: alternatives.length,
		criteriaCount: criteria.length,
		includedMethodsCount: includedMethods.length,
		leaderName: null,
		leaderScore: null,
		leaderSource: null,
		agreementLabel: null,
		hasMeaningfulProgress: hasMeaningfulProgress({
			decision,
			criteria,
			alternatives,
			setupDone,
			appUsed,
		}),
	};

	if (alternatives.length < 2 || criteria.length < 1) {
		return preview;
	}

	const scores = getMethodScores(alternatives, criteria, allocation);

	if (includedMethods.length > 0) {
		const methodRanks = getMethodRanks(scores.normalized10);
		const consensusScore = getConsensusScore10(
			scores.normalized10,
			includedMethods,
		);
		const consensus = getConsensusRank(
			methodRanks,
			includedMethods,
			consensusScore,
		);
		const winnerIndex = consensus.winnerIndex;
		if (winnerIndex != null) {
			const agreement = getAgreementLevel(
				consensus,
				methodRanks,
				includedMethods,
			);
			preview.leaderName = alternatives[winnerIndex]?.name ?? null;
			preview.leaderScore = round(consensusScore[winnerIndex] ?? 0);
			preview.leaderSource = "Consensus preview";
			preview.agreementLabel = agreementLabel[agreement];
		}
		return preview;
	}

	const weighted = scores.normalized10.weightedSum;
	const weightedWinner = weighted
		.map((value, i) => ({ value, i }))
		.sort((a, b) => b.value - a.value || a.i - b.i)[0];

	if (weightedWinner != null) {
		preview.leaderName = alternatives[weightedWinner.i]?.name ?? null;
		preview.leaderScore = round(weightedWinner.value);
		preview.leaderSource = "Weighted Sum preview";
	}

	return preview;
};
