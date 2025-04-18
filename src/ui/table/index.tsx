import type { JSX } from "ovr";

type Row = Record<string, JSX.Element>;

type Column<R extends Row, K extends keyof R = keyof R> = {
	key: K;
	head: (key: K) => JSX.Element;
	cell: (value: R[K]) => JSX.Element;
	foot?: (value: R[K]) => JSX.Element;
};

export const Table = <R extends Row>(props: {
	data: R[];
	columns?: Column<R>[];
}) => {
	const columns = props.columns
		? props.columns
		: Object.keys(props.data.at(0) ?? {}).map((key) => {
				return {
					key,
					head: (key: keyof R) => key,
					cell: (value: R[typeof key]) => value,
				} as Column<R>;
			});

	return (
		<table>
			<thead>
				<tr>
					{columns.map((column) => (
						<th>{column.head(column.key)}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{props.data.map((row) => (
					<tr>
						{columns.map((column) => (
							<td>{column.cell(row[column.key])}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

<Table
	data={[{ hello: true }]}
	columns={[{ key: "hello", head: () => "hello", cell: (v) => v }]}
></Table>;
