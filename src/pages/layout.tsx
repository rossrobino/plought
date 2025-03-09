import type { User } from "@/lib/db/table";
import { Nav } from "@/ui/nav";
import type { Children } from "@robino/jsx";

export const Layout = (props: { children?: Children; user: User | null }) => {
	return (
		<>
			<main class="flex">
				<div class="min-h-screen border-r border-muted p-6 min-w-3xs">
					<Nav user={props.user} />
				</div>
				<div class="basis-full p-6">{props.children}</div>
			</main>
			<footer></footer>
		</>
	);
};
