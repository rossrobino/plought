import type { ModelContext } from "#lib/webmcp.ts";

declare global {
	interface Document {
		modelContext?: ModelContext;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
