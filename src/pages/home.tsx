import type { User } from "@/lib/db/table";

export const Home = (props: { user: User | null }) => {
	return (
		<>
			<h1>Hello {props.user?.firstName}</h1>
		</>
	);
};
