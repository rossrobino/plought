import type { Study, User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";

export const Studies = (props: { user: User | null; studies: Study[] }) => {
	return (
		<Layout user={props.user}>
			<article>
				<h1>Study</h1>
				<a href="/study/create">Create</a>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Title</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{props.studies.map((study) => {
							return (
								<tr>
									<td>
										<a href={`/study/${study.id}`}>#{study.id}</a>
									</td>
									<td>{study.title}</td>
									<td>{study.description}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</article>
		</Layout>
	);
};
