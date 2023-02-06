declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface Alternative {
		name: string;
		scores: number[];
	}
	interface Criteria {
		name: string;
		weight: number;
	}
}

export {};
