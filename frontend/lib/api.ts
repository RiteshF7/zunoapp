// lib/api.ts
// Centralized HTTP helper for calling the Python backend API.
// Every request attaches the Supabase JWT as a Bearer token.

import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

// Android emulator uses 10.0.2.2 to reach host machine's localhost.
// Always override localhost → 10.0.2.2 on Android so the env var works too.
function getBackendUrl(): string {
  const url = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8000";
  if (Platform.OS === "android") {
    return url.replace("://localhost", "://10.0.2.2");
  }
  return url;
}

const BACKEND_URL = getBackendUrl();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (path: string) =>
    request<void>(path, { method: "DELETE" }),
};
