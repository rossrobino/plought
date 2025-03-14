import type { Session, User } from "@/lib/db/table";
import type { Context } from "@robino/router";

export type State = {
	auth: { user: User; session: Session } | { user: null; session: null };
};

export type GenericContext = Context<Record<string, string>, State>;
