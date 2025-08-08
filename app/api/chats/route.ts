import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import { getChatSessions, saveChatSession, deleteChatSession } from '@/app/lib/storage';

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const sessions = await getChatSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load chat sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const session = await request.json();
    await saveChatSession(session);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save chat session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { sessionId } = await request.json();
    await deleteChatSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}