import favicon from "$lib/assets/favicon-dark.png";
import { redirect } from "@sveltejs/kit";

export const GET = () => {
	throw redirect(307, favicon);
};
