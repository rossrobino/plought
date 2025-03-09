import type { Session, User } from "@/lib/db/table";
import type { Page } from "@robino/html";

export type State = {
	page: Page;
	auth: { user: User; session: Session } | { user: null; session: null };
};
