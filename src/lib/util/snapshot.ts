import type { SnapshotImportState, SnapshotState } from "$lib/state";

export const snapshotSchemaVersion = 2;

interface SnapshotFile {
	schemaVersion: number;
	exportedAt: string;
	state: SnapshotState;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value != null && !Array.isArray(value);
};

const assertKnownKeyTypes = (value: Record<string, unknown>) => {
	if ("decision" in value && !isRecord(value.decision)) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("criteria" in value && !Array.isArray(value.criteria)) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("alternatives" in value && !Array.isArray(value.alternatives)) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("allocation" in value && !Array.isArray(value.allocation)) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("rankOrder" in value && !Array.isArray(value.rankOrder)) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("appMeta" in value && !isRecord(value.appMeta)) {
		throw new Error("Snapshot format is not supported.");
	}
	if (
		isRecord(value.appMeta) &&
		"rank" in value.appMeta &&
		!isRecord(value.appMeta.rank)
	) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("methodMeta" in value && !isRecord(value.methodMeta)) {
		throw new Error("Snapshot format is not supported.");
	}
	if (
		isRecord(value.methodMeta) &&
		"rankOrder" in value.methodMeta &&
		!isRecord(value.methodMeta.rankOrder)
	) {
		throw new Error("Snapshot format is not supported.");
	}
	if ("setupStepMeta" in value && !isRecord(value.setupStepMeta)) {
		throw new Error("Snapshot format is not supported.");
	}
};

const getStateSource = (value: Record<string, unknown>) => {
	if (!("state" in value)) {
		return value;
	}
	const state = value.state;
	if (!isRecord(state)) {
		throw new Error("Snapshot format is not supported.");
	}
	return state;
};

const sanitizeState = (value: Record<string, unknown>): SnapshotImportState => {
	const { appMeta, methodMeta, ...state } = value;
	const next: SnapshotImportState = {};

	if ("decision" in state) {
		next.decision = state.decision as SnapshotImportState["decision"];
	}
	if ("criteria" in state) {
		next.criteria = state.criteria as SnapshotImportState["criteria"];
	}
	if ("alternatives" in state) {
		next.alternatives = state.alternatives as SnapshotImportState["alternatives"];
	}
	if ("allocation" in state) {
		next.allocation = state.allocation as SnapshotImportState["allocation"];
	}
	if (isRecord(appMeta)) {
		const { rank: _rank, ...rest } = appMeta;
		next.appMeta = rest as SnapshotImportState["appMeta"];
	}
	if (isRecord(methodMeta)) {
		const { rankOrder: _rankOrder, ...rest } = methodMeta;
		next.methodMeta = rest as SnapshotImportState["methodMeta"];
	}
	if ("setupStepMeta" in state) {
		next.setupStepMeta =
			state.setupStepMeta as SnapshotImportState["setupStepMeta"];
	}

	return next;
};

export const createSnapshotFile = (state: SnapshotState): SnapshotFile => {
	return {
		schemaVersion: snapshotSchemaVersion,
		exportedAt: new Date().toISOString(),
		state,
	};
};

export const serializeSnapshot = (value: SnapshotFile) => {
	return JSON.stringify(value, null, 2);
};

export const parseSnapshotJson = (text: string) => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("Could not read JSON file.");
	}

	if (!isRecord(parsed)) {
		throw new Error("Snapshot format is not supported.");
	}

	if ("schemaVersion" in parsed) {
		const schemaVersion = parsed.schemaVersion;
		if (
			typeof schemaVersion !== "number" ||
			!Number.isInteger(schemaVersion) ||
			(schemaVersion !== 1 && schemaVersion !== snapshotSchemaVersion)
		) {
			throw new Error("Snapshot format is not supported.");
		}
	}

	const state = getStateSource(parsed);
	assertKnownKeyTypes(state);
	return sanitizeState(state);
};

export const sanitizeSnapshotFilename = (title: string) => {
	const raw = title.trim().normalize("NFKD").toLowerCase();
	const base = raw
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 80);
	return `${base || "decision"}.plought.json`;
};
