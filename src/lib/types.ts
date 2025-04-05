import type { Session, User } from "@/lib/db/table";

export type Auth =
	| { user: User; session: Session; token: string }
	| { user: null; session: null; token: null };

export type State = void;
