import type { Session, User } from "@/lib/db/table";

export type State = {
	auth: { user: User; session: Session } | { user: null; session: null };
};
