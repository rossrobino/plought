import type { State } from "../types";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as table from "@/lib/db/table";
import SuperHeaders, { SetCookie } from "@mjackson/headers";
import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import type { Middleware } from "@robino/router";
import { eq } from "drizzle-orm";

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
	token: string | null,
): Promise<State["auth"]> => {
	if (!token) return { session: null, user: null };

	const [auth] = await db
		.select({ user: table.user, session: table.session })
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, getSessionId(token)));

	if (!auth) return { session: null, user: null };

	if (Date.now() >= auth.session.expiresAt.getTime()) {
		// session expired
		await invalidateSession(auth.session.id);

		return { session: null, user: null };
	}

	if (Date.now() >= auth.session.expiresAt.getTime() - day * 15) {
		// renew session
		auth.session.expiresAt = new Date(Date.now() + day * 30);

		await db
			.update(table.session)
			.set({ expiresAt: auth.session.expiresAt })
			.where(eq(table.session.id, auth.session.id));
	}

	return auth;
};

const invalidateSession = async (sessionId: string) =>
	db.delete(table.session).where(eq(table.session.id, sessionId));

export const invalidateAllSessions = async (userId: table.User["id"]) =>
	db.delete(table.session).where(eq(table.session.userId, userId));

export const setSessionTokenCookie = (
	res: Response,
	token: string,
	expiresAt: Date,
) => {
	const setCookie = new SetCookie({
		name: sessionCookieName,
		value: token,
		httpOnly: true,
		sameSite: "Lax",
		expires: expiresAt,
		path: "/",
		secure: import.meta.env.DEV ? undefined : true,
	});

	res.headers.append("Set-Cookie", setCookie.toString());
};

export const deleteSessionTokenCookie = (res: Response) => {
	const setCookie = new SetCookie({
		name: sessionCookieName,
		value: "",
		httpOnly: true,
		sameSite: "Lax",
		maxAge: 0,
		path: "/",
		secure: import.meta.env.DEV ? undefined : true,
	});

	res.headers.append("Set-Cookie", setCookie.toString());
};

export const setAuth: Middleware<any, State> = async (c, next) => {
	// csrf
	if (c.req.method !== "GET") {
		if (c.req.headers.get("Origin") !== constants.origin) {
			c.res = new Response("Forbidden", { status: 403 });
			return;
		}
	}

	const headers = new SuperHeaders(c.req.headers);
	const sessionToken = headers.cookie.get(sessionCookieName);

	c.state.auth = await validateSessionToken(sessionToken);

	await next();

	if (c.res) {
		if (c.state.auth.session && sessionToken) {
			setSessionTokenCookie(
				c.res,
				sessionToken,
				c.state.auth.session.expiresAt,
			);
		} else {
			deleteSessionTokenCookie(c.res);
		}
	}
};
