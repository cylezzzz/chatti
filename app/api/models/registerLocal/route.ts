import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const slot = formData.get('slot') as string;
    const modelName = formData.get('model') as string;
    const modelPath = formData.get('path') as string;
    const files = formData.getAll('files') as File[];

    if (!slot || !modelName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Simuliere Registrierung des Modells
    // In einer echten Implementierung würde hier das Modell verarbeitet und registriert
    
    console.log(`Registering model: ${modelName} for slot: ${slot}`);
    if (modelPath) {
      console.log(`Model path: ${modelPath}`);
    }
    if (files.length > 0) {
      console.log(`Processing ${files.length} uploaded files`);
    }
    
    const response = {
      success: true,
      model: modelName,
      slot,
      path: modelPath || null,
      filesProcessed: files.length,
      message: `Modell ${modelName} erfolgreich für ${slot} registriert`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Model registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register model' },
      { status: 500 }
    );
  }
}