<script lang="ts">
	import { goto } from "$app/navigation";
	import Reset from "$lib/components/Reset.svelte";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		type MethodKey,
		type SetupStepKey,
		type SnapshotImportState,
		decision,
		exportSnapshotState,
		importSnapshotState,
		isMethodUsed,
		isSetupStepUsed,
	} from "$lib/state";
	import {
		createSnapshotFile,
		parseSnapshotJson,
		sanitizeSnapshotFilename,
		serializeSnapshot,
	} from "$lib/util/snapshot";
	import FileIcon from "@lucide/svelte/icons/file";
	import SaveIcon from "@lucide/svelte/icons/save";

	type Tone = "success" | "error" | "info";
	const methodKeys: MethodKey[] = [
		"weightedSum",
		"pairwise",
		"rankOrder",
		"topsis",
		"allocate",
	];
	const setupStepKeys: SetupStepKey[] = ["start", "alternatives", "criteria"];

	type SavePicker = (options?: {
		suggestedName?: string;
		types?: Array<{ description?: string; accept: Record<string, string[]> }>;
	}) => Promise<{
		createWritable: () => Promise<{
			write: (value: string) => Promise<void>;
			close: () => Promise<void>;
		}>;
	}>;

	interface Props {
		onAction?: () => void;
	}

	let { onAction }: Props = $props();
	let fileInput = $state<HTMLInputElement | null>(null);
	let confirmOpen = $state(false);
	let statusOpen = $state(false);
	let pendingImport = $state<SnapshotImportState | null>(null);
	let status = $state<{ tone: Tone; title: string; text: string } | null>(null);

	$effect(() => {
		if (!confirmOpen && pendingImport != null) {
			pendingImport = null;
		}
	});

	const showStatus = (tone: Tone, title: string, text: string) => {
		status = { tone, title, text };
		statusOpen = true;
	};

	const isAbortError = (error: unknown) => {
		return error instanceof DOMException && error.name === "AbortError";
	};

	const getSavePicker = () => {
		if (typeof window === "undefined" || !window.isSecureContext) {
			return null;
		}
		return (window as Window & { showSaveFilePicker?: SavePicker })
			.showSaveFilePicker;
	};

	const downloadWithAnchor = (text: string, filename: string) => {
		const blob = new Blob([text], { type: "application/json" });
		const href = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = href;
		anchor.download = filename;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(href), 1000);
	};

	const saveWithPicker = async (text: string, filename: string) => {
		const picker = getSavePicker();
		if (picker == null) {
			downloadWithAnchor(text, filename);
			return;
		}

		const file = await picker({
			suggestedName: filename,
			types: [
				{
					description: "Plought snapshot",
					accept: { "application/json": [".json"] },
				},
			],
		});
		const writable = await file.createWritable();
		await writable.write(text);
		await writable.close();
	};

	const exportSnapshot = async () => {
		onAction?.();
		try {
			const file = createSnapshotFile(exportSnapshotState());
			const text = serializeSnapshot(file);
			const filename = sanitizeSnapshotFilename(decision.current.title ?? "");
			await saveWithPicker(text, filename);
			showStatus("success", "Downloaded", "Downloaded snapshot.");
		} catch (error) {
			if (isAbortError(error)) {
				return;
			}
			showStatus("error", "Download Failed", "Could not download snapshot.");
		}
	};

	const applyImport = () => {
		if (pendingImport == null) {
			confirmOpen = false;
			return;
		}
		importSnapshotState(pendingImport);
		pendingImport = null;
		confirmOpen = false;
		void goto("/setup");
	};

	const hasUsedState = () => {
		return (
			methodKeys.some((key) => isMethodUsed(key)) ||
			setupStepKeys.some((key) => isSetupStepUsed(key))
		);
	};

	const triggerImport = () => {
		onAction?.();
		fileInput?.click();
	};

	const onFileChange = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = "";
		if (file == null) {
			return;
		}

		try {
			const text = await file.text();
			const parsed = parseSnapshotJson(text);
			if (hasUsedState()) {
				pendingImport = parsed;
				confirmOpen = true;
				return;
			}
			importSnapshotState(parsed);
			void goto("/setup");
		} catch (error) {
			showStatus(
				"error",
				"Open Failed",
				error instanceof Error
					? error.message
					: "Snapshot format is not supported.",
			);
		}
	};
</script>

<div class="grid grid-cols-2 gap-2">
	<Button
		size="sm"
		variant="outline"
		class="w-full justify-center"
		onclick={triggerImport}
	>
		<FileIcon />
		Open
	</Button>
	<Button
		size="sm"
		variant="outline"
		class="w-full justify-center"
		onclick={exportSnapshot}
	>
		<SaveIcon />
		Download
	</Button>
	<input
		bind:this={fileInput}
		type="file"
		class="hidden"
		accept=".json,application/json"
		onchange={onFileChange}
	/>
	<Reset
		variant="outline"
		className="col-span-2 w-full justify-center border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
		{onAction}
	/>
</div>

<AlertDialog.Root bind:open={confirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Replace current decision data?</AlertDialog.Title>
			<AlertDialog.Description>
				Importing will overwrite your current saved decision, criteria,
				alternatives, and method settings.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel class="h-8 px-3 text-sm">Cancel</AlertDialog.Cancel>
			<AlertDialog.Action class="h-8 px-3 text-sm" onclick={applyImport}>
				Import
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={statusOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{status?.title ?? "Notice"}</AlertDialog.Title>
			<AlertDialog.Description>
				{status?.text ?? ""}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Action
				class="h-8 px-3 text-sm"
				onclick={() => {
					statusOpen = false;
				}}
			>
				OK
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
