import { NextResponse } from 'next/server';
import { clearSession } from '@/app/lib/auth';

export async function POST() {
  try {
    clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}