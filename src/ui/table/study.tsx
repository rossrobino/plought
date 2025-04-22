import { Table } from ".";
import type { Study } from "@/lib/db/table";

export const StudyTable = (props: { studies?: Study[] }) => (
	<Table
		data={props.studies}
		columns={(c) => {
			return [
				c("id", { head: "#" }),
				c("title", {
					cell: ({ id, title }) => <a href={`/study/${id}`}>{title}</a>,
				}),
				c("description"),
				c("status", {
					cell: ({ status }) => <span class="capitalize">{status}</span>,
				}),
			];
		}}
	/>
);
