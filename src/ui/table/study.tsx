import type { Study } from "@/lib/db/table";

export const StudyTable = (props: { studies?: Study[] }) => {
	if (!props.studies) return null;

	return (
		<table className="mt-4">
			<thead>
				<tr>
					<th>#</th>
					<th>Title</th>
					<th>Description</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{props.studies.map((study) => (
					<tr key={study.id}>
						<td>{study.id}</td>
						<td>
							<a href={`/study/${study.id}`}>{study.title}</a>
						</td>
						<td>{study.description}</td>
						<td class="capitalize">{study.status}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
