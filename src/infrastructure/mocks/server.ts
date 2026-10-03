import { http, HttpResponse, delay } from "msw";
import type { z } from "zod";
import type { ApiErrorCode } from "@/shared/api/contracts";
import { toFieldErrors } from "@/shared/api/schemas";
import { currentScenario, getDb, mutateDb, runtime, type SessionRecord, type UserRecord, type DbState } from "./db";

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly fieldErrors?: Record<string, string>,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface RouteContext {
  request: Request;
  url: URL;
  params: Record<string, string>;
  cookies: Record<string, string>;
  db: DbState;
  /** Present on authenticated routes. */
  user: UserRecord;
  session: SessionRecord;
  /** Present on every route: optional authenticated identity. */
  maybeUser?: UserRecord;
  json: <T>() => Promise<T>;
}

interface RouteOptions {
  auth?: boolean;
  /** Skip scenario latency/failure injection (control endpoints). */
  control?: boolean;
}

type Method = "get" | "post" | "put" | "patch" | "delete";
type Resolver = (context: RouteContext) => Promise<Response> | Response;

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const failureResponse = (failure: ApiFailure) =>
  HttpResponse.json(
    {
      error: {
        code: failure.code,
        message: failure.message,
        ...(failure.fieldErrors ? { fieldErrors: failure.fieldErrors } : {}),
        ...(failure.details !== undefined ? { details: failure.details } : {}),
      },
    },
    { status: failure.status, headers: { "Cache-Control": "no-store" } },
  );

/** Deterministic pseudo-random sequence (mulberry32) so latency is reproducible. */
let latencySeed = 0xc0ffee;
const nextRandom = () => {
  latencySeed = (latencySeed + 0x6d2b79f5) | 0;
  let t = Math.imul(latencySeed ^ (latencySeed >>> 15), 1 | latencySeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const latencyFor = (url: URL): number => {
  const scenario = currentScenario();
  if (scenario.behavior.outOfOrder && url.pathname === "/api/nfts") {
    const term = url.searchParams.get("q") ?? "";
    return Math.max(100, 2400 - term.length * 600);
  }
  const { min, max } = scenario.latency;
  return Math.round(min + nextRandom() * (max - min));
};

export const readSession = (cookies: Record<string, string>) => {
  const sid = cookies.sid;
  const db = getDb();
  const session = sid ? db.sessions[sid] : undefined;
  if (!sid || !session) return { sid, expired: false as const, session: undefined, user: undefined };
  if (session.expiresAt <= Date.now()) {
    mutateDb((state) => {
      delete state.sessions[sid];
    });
    return { sid, expired: true as const, session: undefined, user: undefined };
  }
  const user = db.users.find((candidate) => candidate.id === session.userId);
  return { sid, expired: false as const, session, user };
};

export const route = (method: Method, path: string, resolver: Resolver, options: RouteOptions = {}) =>
  http[method](path, async ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const scenario = currentScenario();
    const { behavior } = scenario;

    try {
      if (!options.control) {
        await delay(latencyFor(url));
        if (behavior.offline) return HttpResponse.error();
        if (behavior.transientOnce) {
          const key = `${request.method} ${url.pathname}${url.search}`;
          if (!runtime.failedOnce.has(key)) {
            runtime.failedOnce.add(key);
            throw new ApiFailure(503, "TRANSIENT", "Serviço temporariamente indisponível");
          }
        }
        if (behavior.catalogServerError && request.method === "GET" && url.pathname === "/api/nfts") {
          throw new ApiFailure(500, "TRANSIENT", "Erro interno no catálogo");
        }
      }

      const resolved = readSession(cookies);

      if (!resolved.session && options.auth) {
        throw new ApiFailure(
          401,
          resolved.expired ? "SESSION_EXPIRED" : "UNAUTHENTICATED",
          resolved.expired ? "Sua sessão expirou" : "Autenticação necessária",
        );
      }

      if (UNSAFE.has(request.method) && !options.control) {
        if (resolved.session) {
          const header = request.headers.get("x-csrf-token");
          if (!header || header !== resolved.session.csrf || header !== cookies.csrf) {
            throw new ApiFailure(403, "CSRF_REJECTED", "Token CSRF inválido");
          }
        } else if (request.headers.get("x-requested-with") !== "XMLHttpRequest") {
          // TODO(security): a real backend must issue a pre-session CSRF token for login/register.
          throw new ApiFailure(403, "CSRF_REJECTED", "Requisição não permitida");
        }
      }

      return await resolver({
        request,
        url,
        params: Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]),
        ),
        cookies,
        db: getDb(),
        user: resolved.user as UserRecord,
        session: resolved.session as SessionRecord,
        maybeUser: resolved.user,
        json: async <T>() => {
          try {
            return (await request.clone().json()) as T;
          } catch {
            throw new ApiFailure(400, "VALIDATION_ERROR", "Corpo da requisição inválido");
          }
        },
      });
    } catch (error) {
      if (error instanceof ApiFailure) return failureResponse(error);
      // Generic message to the client; details are intentionally not echoed.
      return failureResponse(new ApiFailure(500, "TRANSIENT", "Erro inesperado"));
    }
  });

export const ok = <T>(body: T, init?: { status?: number; headers?: Headers }) => {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return HttpResponse.json(body as never, { status: init?.status ?? 200, headers });
};

/* ------------------------------ Validation ------------------------------ */
/** Validates untrusted input with a shared zod schema; failures become 422 field errors. */
export const parse = <S extends z.ZodType>(schema: S, data: unknown): z.output<S> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiFailure(422, "VALIDATION_ERROR", "Dados inválidos", toFieldErrors(result.error));
  }
  return result.data;
};
