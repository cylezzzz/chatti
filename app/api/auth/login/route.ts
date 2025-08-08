import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createSession } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }
    
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    createSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}