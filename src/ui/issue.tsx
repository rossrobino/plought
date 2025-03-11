import type { ZodIssue } from "zod";

export const Issues = (props: { issues?: ZodIssue[] }) => (
	<>{props.issues?.map((i) => <Issue issue={i} />)}</>
);

export const Issue = (props: { issue?: ZodIssue }) => {
	if (props.issue) {
		return (
			<div class="border border-destructive/75 p-3 my-3 rounded">
				<ul>
					{props.issue.path.map((p) => (
						<li class="font-bold capitalize">{p}</li>
					))}
				</ul>
				<p>{props.issue.message}</p>
			</div>
		);
	}

	return null;
};
