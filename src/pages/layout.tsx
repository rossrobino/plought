import type { User } from "@/lib/db/table";
import clsx from "clsx";
import type { JSX } from "ovr";

export const Layout = (props: {
	children?: JSX.Element;
	user: User | null;
}) => {
	return (
		<>
			<main class="lg:flex">
				<Nav user={props.user} />
				<div class="basis-full p-6">{props.children}</div>
			</main>
		</>
	);
};

const links: { text: string; href: string }[] = [
	{ text: "Home", href: "/" },
	{ text: "Studies", href: "/study" },
	// { text: "Explore", href: "/explore" },
	// { text: "Research", href: "/research" },
] as const;

const NavPanel = (
	props: { user: User | null } & JSX.IntrinsicElements["nav"],
) => {
	const { user, class: className, ...rest } = props;
	return (
		<nav
			class={clsx(
				"flex flex-col justify-between h-full gap-3 min-h-screen border-r border-muted p-4 min-w-3xs",
				className,
			)}
			{...rest}
		>
			<ul class="flex flex-col gap-1">
				{links.map((link) => {
					return (
						<li>
							<a class="button ghost justify-start" href={link.href}>
								{link.text}
							</a>
						</li>
					);
				})}
			</ul>
			<a class="button secondary" href={props.user ? "/logout" : "/login"}>
				{props.user ? "Logout" : "Login"}
			</a>
		</nav>
	);
};

const NavDialog = (props: { user: User | null }) => {
	return (
		<div class="p-4 block lg:hidden">
			<drab-dialog click-outside-close remove-body-scroll>
				<button data-trigger class="ghost icon" aria-label="open navigation">
					<span class="icon-[lucide--align-justify]"></span>
				</button>
				<dialog
					data-content
					class="min-h-screen backdrop:bg-muted/75 backdrop:backdrop-blur-lg"
				>
					<NavPanel user={props.user}></NavPanel>
				</dialog>
			</drab-dialog>
		</div>
	);
};

const Nav = (props: { user: User | null }) => {
	return (
		<>
			<NavDialog user={props.user} />
			<NavPanel user={props.user} class="hidden lg:flex" />
		</>
	);
};
