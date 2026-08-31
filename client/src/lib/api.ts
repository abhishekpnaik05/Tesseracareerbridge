const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

let refreshInFlight: Promise<boolean> | null = null;

async function parse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { data?: T } & ErrorBody;
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      body.error?.code ?? "ERROR",
      body.error?.message ?? "Something went wrong. Please try again.",
    );
  }
  return body.data as T;
}

function shouldRefresh(path: string, status: number) {
  if (status !== 401) return false;
  return !path.startsWith("/auth/login") && !path.startsWith("/auth/refresh") && !path.startsWith("/auth/register");
}

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit, retried = false): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (shouldRefresh(path, response.status) && !retried) {
    const ok = await refreshSession();
    if (ok) return request<T>(path, init, true);
  }
  return parse<T>(response);
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
