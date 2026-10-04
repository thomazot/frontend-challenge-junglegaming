import type { LoginInput, RegisterInput, Session } from "@/shared/api/contracts";
import { ApiError, http } from "@/shared/api/http";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseSession = (value: unknown): Session => {
  if (
    !isRecord(value) ||
    !isRecord(value.user) ||
    typeof value.user.id !== "string" ||
    typeof value.user.name !== "string" ||
    typeof value.user.email !== "string" ||
    typeof value.user.createdAt !== "string" ||
    (value.user.avatarUrl !== undefined && typeof value.user.avatarUrl !== "string") ||
    typeof value.expiresAt !== "string" ||
    typeof value.csrfToken !== "string"
  ) {
    throw new ApiError("UNKNOWN", "Resposta da sessão inválida", 502);
  }

  return {
    user: {
      id: value.user.id,
      name: value.user.name,
      email: value.user.email,
      createdAt: value.user.createdAt,
      ...(typeof value.user.avatarUrl === "string" ? { avatarUrl: value.user.avatarUrl } : {}),
    },
    expiresAt: value.expiresAt,
    csrfToken: value.csrfToken,
  };
};

export const register = async (input: RegisterInput): Promise<Session> => {
  const { data } = await http.post<unknown>("/auth/register", input);
  return parseSession(data);
};

export const login = async (input: LoginInput): Promise<Session> => {
  const { data } = await http.post<unknown>("/auth/login", input);
  return parseSession(data);
};

/** Restores the session from cookies; resolves null when the user is anonymous. */
export const getSession = async (signal?: AbortSignal): Promise<Session | null> => {
  const { data } = await http.get<unknown>("/auth/session", { signal });
  return data === null ? null : parseSession(data);
};

export const logout = async (): Promise<void> => {
  await http.post("/auth/logout");
};
