import type { LoginInput, RegisterInput, Session } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

export const register = async (input: RegisterInput): Promise<Session> => {
  const { data } = await http.post<Session>("/auth/register", input);
  return data;
};

export const login = async (input: LoginInput): Promise<Session> => {
  const { data } = await http.post<Session>("/auth/login", input);
  return data;
};

/** Restores the session from cookies; rejects with SESSION_EXPIRED/UNAUTHENTICATED when absent. */
export const getSession = async (signal?: AbortSignal): Promise<Session> => {
  const { data } = await http.get<Session>("/auth/session", { signal });
  return data;
};

export const logout = async (): Promise<void> => {
  await http.post("/auth/logout");
};
