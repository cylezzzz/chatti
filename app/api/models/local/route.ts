import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MODELS_DIRS = [
  '/models',
  '/usr/local/models',
  path.join(process.env.HOME || '', 'models'),
  path.join(process.env.HOME || '', '.ollama/models'),
  path.join(process.cwd(), 'models'),
];

export async function GET() {
  try {
    const localModels = [];
    
    for (const dir of MODELS_DIRS) {
      try {
        await fs.access(dir);
        const files = await fs.readdir(dir, { withFileTypes: true });
        
        for (const file of files) {
          if (file.isFile() && isModelFile(file.name)) {
            const filePath = path.join(dir, file.name);
            const stats = await fs.stat(filePath);
            
            localModels.push({
              name: file.name,
              path: filePath,
              size: formatFileSize(stats.size),
              modified: stats.mtime.toISOString().split('T')[0],
              type: getModelType(file.name),
            });
          }
        }
      } catch (error) {
        // Verzeichnis existiert nicht oder keine Berechtigung
        continue;
      }
    }
    
    return NextResponse.json({ models: localModels });
  } catch (error) {
    console.error('Error scanning local models:', error);
    return NextResponse.json({ models: [] });
  }
}

function isModelFile(filename: string): boolean {
  const extensions = ['.gguf', '.safetensors', '.bin', '.pt', '.pth', '.ckpt'];
  return extensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function getModelType(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes('llama') || name.includes('chat')) return 'chat';
  if (name.includes('deepseek') || name.includes('cod')) return 'code';
  if (name.includes('diffusion') || name.includes('sd')) return 'image';
  return 'unknown';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}