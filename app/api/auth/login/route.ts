export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { validatePassword } from '@/app/lib/auth';

const SESSION_COOKIE = 'ai-app-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Passwort fehlt' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE, JSON.stringify({
      authenticated: true,
      expires: Date.now() + SESSION_DURATION,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
