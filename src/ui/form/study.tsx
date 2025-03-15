import type { Study } from "@/lib/db/table";
import { Checkbox, Input, Textarea } from "@/ui/form";

export const StudyForm = (props: { study?: Partial<Study> }) => {
	return (
		<form method="post" class="space-y-3">
			<Input name="title" value={props.study?.title ?? ""} />
			<Textarea name="description">{props.study?.description ?? ""}</Textarea>
			<Checkbox name="public" checked={props.study?.public ? true : false} />
			<button>Submit</button>
		</form>
	);
};
