const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const KEY = process.env.NEXT_PUBLIC_API_KEY || "dev-key";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "x-api-key": KEY, ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getAnalytics: (programId?: string) =>
    apiFetch<{ totalIssued: number; totalRedeemed: number; outstanding: number; eventCount: number }>(
      `/api/events/analytics${programId ? `?programId=${programId}` : ""}`
    ),
  getEvents: (programId?: string) =>
    apiFetch<Array<{ id: string; programId: string; userPublicKey: string; action: string; points: number; createdAt: string }>>(
      `/api/events${programId ? `?programId=${programId}` : ""}`
    ),
  createBusiness: (name: string, email: string) =>
    apiFetch<{ id: string; name: string; publicKey: string }>("/api/businesses", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    }),
  createUser: (email: string) =>
    apiFetch<{ id: string; email: string; publicKey: string }>("/api/users", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  trackEvent: (data: { programId: string; userPublicKey: string; action: string; points: number; txHash?: string }) =>
    apiFetch("/api/events", { method: "POST", body: JSON.stringify(data) }),
};
