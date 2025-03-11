import { Layout } from "@/pages/layout";
import google from "@/ui/svg/google.svg?raw";

export const Login = () => {
	return (
		<Layout user={null}>
			<article class="prose">
				<h1>Login</h1>
				<div class="border rounded-xl flex items-center justify-center p-6">
					<a class="contents" href="/login/google">
						{google}
					</a>
				</div>
			</article>
		</Layout>
	);
};
