import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import { saveUploadedFile } from '@/app/lib/storage';

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const url = await saveUploadedFile(file);
    
    return NextResponse.json({
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}