async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const auth = {
  me: () => request<{ user: { id: string; email: string; name: string | null; role: string } | null }>('/api/auth/me'),
  requestOtp: (email: string) => request<{ ok: boolean }>('/api/auth/request-otp', {
    method: 'POST', body: JSON.stringify({ email }),
  }),
  verifyOtp: (email: string, code: string) => request<{ ok: boolean; user: any; needsName: boolean }>('/api/auth/verify-otp', {
    method: 'POST', body: JSON.stringify({ email, code }),
  }),
  setName: (name: string) => request<{ ok: boolean; name: string }>('/api/auth/set-name', {
    method: 'POST', body: JSON.stringify({ name }),
  }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
};

export const docs = {
  list: () => request<{ docs: Array<{ slug: string; title: string }> }>('/api/docs'),
  get: (slug: string) => request<{ slug: string; content: string }>(`/api/docs/${slug}`),
};

export const admin = {
  invite: (email: string, role?: string) => request<{ ok: boolean; id: string }>('/api/admin/invite', {
    method: 'POST', body: JSON.stringify({ email, role }),
  }),
};
