import type { User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";

export const Home = (props: { user: User | null }) => {
	return (
		<Layout user={props.user}>
			<h1>Hello {props.user?.firstName}</h1>
		</Layout>
	);
};
