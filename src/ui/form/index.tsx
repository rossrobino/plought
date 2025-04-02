import { clsx } from "clsx";
import type { JSX } from "ovr";

export const Label = (
	props: ({ for: string } | { children: JSX.Element }) &
		JSX.IntrinsicElements["label"],
) => {
	const { for: htmlFor, class: className, children, ...rest } = props;

	return (
		<label for={htmlFor} class={clsx("capitalize", className)} {...rest}>
			{htmlFor?.split("-").join(" ") || children}
		</label>
	);
};

export const Input = (
	props: {
		name: string;
		label?: string;
	} & JSX.IntrinsicElements["input"],
) => {
	const { name, type, label = name, ...rest } = props;

	return (
		<div>
			<Label for={label} />
			<input name={name} type={type} id={label} {...rest} />
		</div>
	);
};

export const Checkbox = (
	props: {
		name: string;
		label?: string;
		desc?: string;
	} & JSX.IntrinsicElements["input"],
) => {
	const { name, label = name, desc, ...rest } = props;

	return (
		<div>
			<Label class="flex gap-2 items-center">
				<input
					switch
					type="checkbox"
					name={name}
					id={label}
					value={label}
					{...rest}
				/>
				<div>{label.split("-").join(" ")}</div>
			</Label>
			{desc && <div>{desc}</div>}
		</div>
	);
};

export const Textarea = (
	props: {
		name: string;
	} & JSX.IntrinsicElements["textarea"],
) => {
	const { name, ...rest } = props;

	return (
		<div>
			<Label for={name} />
			<textarea name={name} id={name} {...rest} />
		</div>
	);
};
