import { cookies } from 'next/headers';

const ADMIN_PASSWORD = 'admin123'; // In production, use environment variables
const SESSION_COOKIE = 'ai-app-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    
    if (!session) return false;
    
    const sessionData = JSON.parse(session.value);
    const now = Date.now();
    
    return sessionData.expires > now && sessionData.authenticated === true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createSession() {
  const sessionData = {
    authenticated: true,
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
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}