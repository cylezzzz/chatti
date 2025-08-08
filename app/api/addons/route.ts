import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import { getAddons, saveAddon } from '@/app/lib/storage';

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const addons = await getAddons();
    return NextResponse.json({ addons });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load addons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const addon = await request.json();
    await saveAddon(addon);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save addon' },
      { status: 500 }
    );
  }
}