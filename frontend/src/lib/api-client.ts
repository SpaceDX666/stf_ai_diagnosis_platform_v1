import { redirectToLogin } from "@/lib/client-session";

export class PortalApiError extends Error { constructor(public readonly status: number, public readonly errorId: string | null, message: string) { super(message); } }
export async function portalFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") void redirectToLogin();
    let message = `Request failed (${response.status})`; let errorId: string | null = null;
    try { const body = await response.json() as { error?: { message?: string; errorId?: string } }; message = body.error?.message ?? message; errorId = body.error?.errorId ?? null; } catch { /* response has no usable JSON */ }
    throw new PortalApiError(response.status, errorId, message);
  }
  return await response.json() as T;
}
