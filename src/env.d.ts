/// <reference types="vite/client" />
/// <reference types="domco/env" />

interface ImportMetaEnv {
	readonly VITE_DATABASE_URL: string;
	readonly VITE_GOOGLE_CLIENT_ID: string;
	readonly VITE_GOOGLE_CLIENT_SECRET: string;
}

declare module "*.md" {
	import type { Heading } from "@robino/md";

	export const html: string;
	export const article: string;
	export const headings: Heading[];
}
