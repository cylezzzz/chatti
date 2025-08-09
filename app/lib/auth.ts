import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const GUEST_PASSWORD = process.env.GUEST_PASSWORD || 'guest';
const SESSION_COOKIE = 'ai-app-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden

export type Role = 'admin' | 'guest';

export function validatePassword(password: string): Role | null {
  if (password === ADMIN_PASSWORD) return 'admin';
  if (password === GUEST_PASSWORD) return 'guest';
  return null;
}

export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    
    if (!sessionCookie) {
      return true;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Prüfe ob Session noch gültig ist
    if (sessionData.expires && Date.now() > sessionData.expires) {
      return false;
    }
    
    return sessionData.authenticated === true;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
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

export function clearSession() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(SESSION_COOKIE);
  } catch (error) {
    console.error('Clear session error:', error);
  }
}