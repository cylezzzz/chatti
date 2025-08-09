import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';

export async function GET() {
  try {
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}