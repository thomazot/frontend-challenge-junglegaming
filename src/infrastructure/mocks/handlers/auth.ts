import type { Session } from "@/shared/api/contracts";
import { loginSchema, registerSchema } from "@/shared/api/schemas";
import { currentScenario, hashPassword, mutateDb, nextId, randomToken, runtime } from "../db";
import { cookieHeader, mergeGuestCart, publicUser } from "../domain";
import { ApiFailure, ok, parse, route } from "../server";

const SESSION_TTL_MS = 60 * 60 * 1000;
const SHORT_SESSION_TTL_MS = 15 * 1000;
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 5;

const openSession = (userId: string, guestKey?: string) => {
  const ttl = currentScenario().behavior.shortSessions ? SHORT_SESSION_TTL_MS : SESSION_TTL_MS;
  const sid = randomToken(32);
  const csrf = randomToken(16);
  const expiresAt = Date.now() + ttl;
  mutateDb((db) => {
    db.sessions[sid] = { userId, csrf, expiresAt };
  });
  if (guestKey) mergeGuestCart(guestKey, `user:${userId}`);
  const headers = new Headers();
  headers.append("Set-Cookie", cookieHeader("sid", sid));
  headers.append("Set-Cookie", cookieHeader("csrf", csrf));
  headers.append("Set-Cookie", cookieHeader("guest", "", 0));
  return { headers, csrf, expiresAt };
};

const sessionBody = (userId: string, csrf: string, expiresAt: number): Session => {
  const user = mutateDb((db) => db.users.find((candidate) => candidate.id === userId));
  return { user: publicUser(user!), csrfToken: csrf, expiresAt: new Date(expiresAt).toISOString() };
};

export const authHandlers = [
  route("post", "/api/auth/register", async (ctx) => {
    const input = parse(registerSchema, await ctx.json());
    if (ctx.db.users.some((user) => user.email === input.email)) {
      throw new ApiFailure(409, "EMAIL_TAKEN", "Este e-mail já está cadastrado", { email: "Este e-mail já está cadastrado" });
    }
    const salt = randomToken(16);
    const passwordHash = await hashPassword(input.password, salt);
    const id = nextId("user", "u");
    mutateDb((db) => {
      db.users.push({ id, name: input.name, email: input.email, createdAt: new Date().toISOString(), passwordSalt: salt, passwordHash });
      db.favorites[id] = [];
      db.wallets[id] = [];
    });
    const guest = ctx.cookies.guest && /^g-[0-9a-f]{16}$/.test(ctx.cookies.guest) ? `guest:${ctx.cookies.guest}` : undefined;
    const { headers, csrf, expiresAt } = openSession(id, guest);
    return ok(sessionBody(id, csrf, expiresAt), { status: 201, headers });
  }),

  route("post", "/api/auth/login", async (ctx) => {
    const input = parse(loginSchema, await ctx.json());

    const now = Date.now();
    const recent = (runtime.loginAttempts.get(input.email) ?? []).filter((at) => now - at < LOGIN_WINDOW_MS);
    if (recent.length >= LOGIN_MAX_ATTEMPTS) throw new ApiFailure(429, "RATE_LIMITED", "Muitas tentativas. Tente novamente em instantes.");

    const user = ctx.db.users.find((candidate) => candidate.email === input.email);
    // Always hash, so response time does not reveal whether the e-mail exists.
    const candidateHash = await hashPassword(input.password, user?.passwordSalt ?? "00".repeat(16));
    if (candidateHash !== user?.passwordHash) {
      runtime.loginAttempts.set(input.email, [...recent, now]);
      throw new ApiFailure(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos");
    }
    runtime.loginAttempts.delete(input.email);

    const guest = ctx.cookies.guest && /^g-[0-9a-f]{16}$/.test(ctx.cookies.guest) ? `guest:${ctx.cookies.guest}` : undefined;
    const { headers, csrf, expiresAt } = openSession(user.id, guest);
    return ok(sessionBody(user.id, csrf, expiresAt), { headers });
  }),

  route("get", "/api/auth/session", (ctx) => {
    if (!ctx.maybeUser || !ctx.session) {
      if (ctx.sessionExpired) {
        throw new ApiFailure(401, "SESSION_EXPIRED", "Sua sessão expirou");
      }
      if (ctx.cookies.sid) {
        throw new ApiFailure(401, "UNAUTHENTICATED", "Autenticação necessária");
      }
      return ok(null);
    }
    return ok(sessionBody(ctx.user.id, ctx.session.csrf, ctx.session.expiresAt));
  }),

  route("post", "/api/auth/logout", (ctx) => {
    const { sid } = ctx.cookies;
    mutateDb((db) => {
      // Invalidate every session of the user, not only the current one.
      for (const [key, session] of Object.entries(db.sessions)) {
        if (session.userId === ctx.user.id || key === sid) delete db.sessions[key];
      }
    });
    const headers = new Headers();
    headers.append("Set-Cookie", cookieHeader("sid", "", 0));
    headers.append("Set-Cookie", cookieHeader("csrf", "", 0));
    return ok({ ok: true }, { headers });
  }, { auth: true }),
];

export { cartOwner } from "../domain";
