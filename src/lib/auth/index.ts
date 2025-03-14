import type { GenericContext, State } from "../types";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as table from "@/lib/db/table";
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
	c: GenericContext,
	token: string,
	expiresAt: Date,
) => {
	c.res.headers.setCookie = {
		name: sessionCookieName,
		value: token,
		httpOnly: true,
		sameSite: "Lax",
		expires: expiresAt,
		path: "/",
		secure: import.meta.env.DEV ? undefined : true,
	};
};

export const deleteSessionTokenCookie = (c: GenericContext) => {
	c.res.headers.setCookie = {
		name: sessionCookieName,
		value: "",
		httpOnly: true,
		sameSite: "Lax",
		maxAge: 0,
		path: "/",
		secure: import.meta.env.DEV ? undefined : true,
	};
};

export const setAuth = (loginRedirect = false) => {
	const mw: Middleware<any, State> = async (c, next) => {
		// csrf
		if (c.req.method !== "GET") {
			if (c.req.headers.get("Origin") !== constants.origin) {
				c.res.set("Forbidden", { status: 403 });
				return;
			}
		}

		const sessionToken = c.req.headers.cookie.get(sessionCookieName);

		c.state.auth = await validateSessionToken(sessionToken);

		if (loginRedirect && !c.state.auth.session) {
			c.res.redirect("/login");
			return;
		}

		await next();

		if (c.res) {
			if (c.state.auth.session && sessionToken) {
				setSessionTokenCookie(c, sessionToken, c.state.auth.session.expiresAt);
			} else {
				deleteSessionTokenCookie(c);
			}
		}
	};

	return mw;
};
