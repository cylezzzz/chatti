const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const GUEST_PASSWORD = process.env.GUEST_PASSWORD || 'guest';

export type Role = 'admin' | 'guest';

export function validatePassword(password: string): Role | null {
  if (password === ADMIN_PASSWORD) return 'admin';
  if (password === GUEST_PASSWORD) return 'guest';
  return null;
}

export function createSession(role: Role) {
  const sessionData = {
    authenticated: true,
    role,
    expires: Date.now() + SESSION_DURATION,
  };

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
  });
}
