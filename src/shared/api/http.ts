import axios, { AxiosError } from "axios";
import type { ApiErrorBody, ApiErrorCode } from "./contracts";

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);
export const SESSION_EXPIRED_EVENT = "kurio:session-expired";

const readCookie = (name: string): string | undefined => {
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
};

export const http = axios.create({
  baseURL: "/api",
  timeout: 8000,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

/** Double-submit CSRF token: cookie issued at login is echoed in a header. */
http.interceptors.request.use((config) => {
  if (UNSAFE_METHODS.has((config.method ?? "get").toLowerCase())) {
    const csrf = readCookie("csrf");
    if (csrf) config.headers.set("X-CSRF-Token", csrf);
  }
  return config;
});

export class ApiError extends Error {
  readonly code: ApiErrorCode | "NETWORK" | "TIMEOUT" | "UNKNOWN";
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  readonly details?: unknown;

  constructor(
    code: ApiError["code"],
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }

  /** Safe to retry automatically (no business decision involved). */
  get isTransient() {
    return this.code === "NETWORK" || this.code === "TIMEOUT" || this.status >= 500;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isCancel(error)) return new ApiError("UNKNOWN", "Requisição cancelada", 0);
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("TIMEOUT", "A requisição demorou demais", 0);
    }
    if (!error.response) return new ApiError("NETWORK", "Sem conexão com o servidor", 0);
    const body = error.response.data as Partial<ApiErrorBody> | undefined;
    if (body?.error) {
      const { code, message, fieldErrors, details } = body.error;
      return new ApiError(code, message, error.response.status, fieldErrors, details);
    }
    return new ApiError("UNKNOWN", "Erro inesperado", error.response.status);
  }
  return new ApiError("UNKNOWN", "Erro inesperado", 0);
};

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.code === "SESSION_EXPIRED" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(apiError);
  },
);
