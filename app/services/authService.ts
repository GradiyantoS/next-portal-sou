// src/services/authService.ts
export type LoginResponse = {
  token: string;
  wedding_code: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Login failed');
    throw new Error(msg || 'Login failed');
  }
  return res.json();
}
