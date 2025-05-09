import type { State } from "./types";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as table from "@/lib/db/table";
import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { Google } from "arctic";
import { parse, serialize } from "cookie-es";
import { eq } from "drizzle-orm";
import { context, type Middleware, type Params } from "ovr";

const day = 1000 * 60 * 60 * 24;
const sessionCookieName = "auth-session";

export const generateSessionToken = () =>
	encodeBase32LowerCaseNoPadding(crypto.getRandomValues(new Uint8Array(20)));

const getSessionId = (token: string) =>
	encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

export const createSession = async (
	token: string,
	userId: table.User["id"],
) => {
	const [session] = await db
		.insert(table.session)
		.values({
			id: getSessionId(token),
			userId,
			expiresAt: new Date(Date.now() + day * 30),
		})
		.returning();

	if (!session) throw new Error("Unable to insert session.");

	return session;
};

const validateSessionToken = async (
	token?: string,
): Promise<
	| { user: table.User; session: table.Session; token: string }
	| { user: null; session: null; token: null }
> => {
	const nulls = { session: null, user: null, token: null };
	if (!token) return nulls;

	const [auth] = await db
		.select({ user: table.user, session: table.session })
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, getSessionId(token)));

	if (!auth) return nulls;

	if (Date.now() >= auth.session.expiresAt.getTime()) {
		// session expired
		await invalidateSession(auth.session.id);
		return nulls;
	}

	if (Date.now() >= auth.session.expiresAt.getTime() - day * 15) {
		// renew session
		auth.session.expiresAt = new Date(Date.now() + day * 30);

		await db
			.update(table.session)
			.set({ expiresAt: auth.session.expiresAt })
			.where(eq(table.session.id, auth.session.id));
	}

	return { ...auth, token };
};

const invalidateSession = async (sessionId: string) =>
	db.delete(table.session).where(eq(table.session.id, sessionId));

export const invalidateAllSessions = async (userId: table.User["id"]) =>
	db.delete(table.session).where(eq(table.session.userId, userId));

export const setSessionTokenCookie = (token: string, expiresAt: Date) =>
	context().headers.set(
		"Set-Cookie",
		serialize(sessionCookieName, token, {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			secure: import.meta.env.DEV ? undefined : true,
			expires: expiresAt,
		}),
	);

export const deleteSessionTokenCookie = () =>
	context().headers.set(
		"Set-Cookie",
		serialize(sessionCookieName, "", {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			secure: import.meta.env.DEV ? undefined : true,
			maxAge: 0,
		}),
	);

export const get = async () => {
	const c = context();

	const cookie = parse(c.req.headers.get("cookie") || "");
	const sessionToken = cookie[sessionCookieName];
	const auth = await validateSessionToken(sessionToken);

	if (auth.session) {
		setSessionTokenCookie(auth.token, auth.session.expiresAt);
	} else {
		deleteSessionTokenCookie();
	}

	return auth;
};

export const csrf: Middleware<State, Params> = async (c, next) => {
	if (c.req.method !== "GET") {
		if (c.req.headers.get("Origin") !== constants.origin) {
			c.html("Forbidden", 403);
			return;
		}
	}

	await next();
};

if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID not set");
if (!process.env.GOOGLE_CLIENT_SECRET)
	throw new Error("GOOGLE_CLIENT_SECRET not set");

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${constants.origin}/login/google/callback`,
);
