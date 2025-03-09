import svg from "@/ui/svg/google.svg?raw";

export const Login = () => {
	return (
		<article class="prose">
			<h1>Login</h1>
			<div class="border rounded-xl flex items-center justify-center p-6">
				<a class="contents" href="/login/google">
					{svg}
				</a>
			</div>
		</article>
	);
};
