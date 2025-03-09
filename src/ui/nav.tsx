import type { User } from "@/lib/db/table";

const links: { text: string; href: string }[] = [
	{ text: "About", href: "/about" },
	{ text: "Dashboard", href: "/" },
	{ text: "Explore", href: "/explore" },
	{ text: "Studies", href: "/studies" },
	{ text: "Research", href: "/research" },
] as const;

export const Nav = (props: { user: User | null }) => {
	return (
		<nav class="flex flex-col justify-between h-full gap-3">
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
