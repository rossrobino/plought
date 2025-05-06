import type { User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";
import googleSvg from "@/svg/google.svg";

export const Login = (props: { user: User | null }) => {
	return (
		<Layout user={props.user}>
			<article class="prose">
				<h1>Login</h1>
				<div class="border rounded-xl flex items-center justify-center p-6">
					<a class="contents" href="/login/google">
						<img src={googleSvg} alt="Login with Google" />
					</a>
				</div>
			</article>
		</Layout>
	);
};
