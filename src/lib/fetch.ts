export const redirect = (Location: string, status = 302) => {
	return new Response(null, { status, headers: { Location } });
};
