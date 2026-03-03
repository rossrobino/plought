<script lang="ts">
	import { type WithElementRef, cn } from "$lib/utils.js";
	import type { HTMLTableAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> = $props();

	let hoverCol = $state<number | null>(null);
	let activeCell = $state<HTMLTableCellElement | null>(null);

	const getTable = () => {
		if (ref instanceof HTMLTableElement) {
			return ref;
		}
		return null;
	};

	const getCell = (target: EventTarget | null) => {
		if (!(target instanceof Element)) {
			return null;
		}
		const cell = target.closest("td, th");
		if (!(cell instanceof HTMLTableCellElement)) {
			return null;
		}
		const table = getTable();
		if (table == null || !table.contains(cell)) {
			return null;
		}
		return cell;
	};

	const clearColumn = () => {
		const table = getTable();
		if (table == null) {
			return;
		}
		for (const cell of table.querySelectorAll(
			"td[data-col-active], th[data-col-active]",
		)) {
			cell.removeAttribute("data-col-active");
		}
	};

	const setColumn = (index: number) => {
		const table = getTable();
		if (table == null) {
			return;
		}
		for (const row of Array.from(table.rows)) {
			const cell = row.cells.item(index);
			if (cell != null) {
				cell.setAttribute("data-col-active", "true");
			}
		}
	};

	const setActive = (cell: HTMLTableCellElement | null) => {
		if (activeCell === cell) {
			return;
		}
		activeCell?.removeAttribute("data-cell-active");
		activeCell = cell;
		activeCell?.setAttribute("data-cell-active", "true");
	};

	const clearHover = () => {
		hoverCol = null;
		clearColumn();
		setActive(null);
	};

	const updateHover = (cell: HTMLTableCellElement | null) => {
		if (cell == null) {
			clearHover();
			return;
		}
		const row = cell.parentElement;
		if (!(row instanceof HTMLTableRowElement)) {
			clearHover();
			return;
		}
		const index = row.cells.length ? Array.from(row.cells).indexOf(cell) : -1;
		if (index < 0) {
			clearHover();
			return;
		}
		setActive(cell);
		if (hoverCol === index) {
			return;
		}
		clearColumn();
		hoverCol = index;
		setColumn(index);
	};

	const handlePointerOver = (event: PointerEvent) => {
		updateHover(getCell(event.target));
	};

	const handlePointerLeave = () => {
		clearHover();
	};

	const handleFocusIn = (event: FocusEvent) => {
		updateHover(getCell(event.target));
	};

	const handleFocusOut = (event: FocusEvent) => {
		const table = getTable();
		if (
			!(event.relatedTarget instanceof Node) ||
			table == null ||
			!table.contains(event.relatedTarget)
		) {
			clearHover();
		}
	};
</script>

<div data-slot="table-container" class="relative w-full overflow-x-auto">
	<table
		bind:this={ref}
		data-slot="table"
		class={cn("w-full caption-bottom text-sm", className)}
		onpointerover={handlePointerOver}
		onpointerleave={handlePointerLeave}
		onfocusin={handleFocusIn}
		onfocusout={handleFocusOut}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
