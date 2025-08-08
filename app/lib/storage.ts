import fs from 'fs/promises';
import path from 'path';
import { Addon, ChatSession } from '@/app/types';

const ADDONS_DIR = path.join(process.cwd(), 'data', 'addons');
const CHATS_DIR = path.join(process.cwd(), 'data', 'chats');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function getAddons(): Promise<Addon[]> {
  await ensureDir(ADDONS_DIR);
  
  try {
    const files = await fs.readdir(ADDONS_DIR);
    const addonFiles = files.filter(file => file.endsWith('.json'));
    
    const addons: Addon[] = [];
    for (const file of addonFiles) {
      try {
        const content = await fs.readFile(path.join(ADDONS_DIR, file), 'utf-8');
        const addon = JSON.parse(content) as Addon;
        addons.push(addon);
      } catch (error) {
        console.error(`Error loading addon ${file}:`, error);
      }
    }
    
    return addons;
  } catch {
    return [];
  }
}

export async function saveAddon(addon: Addon): Promise<void> {
  await ensureDir(ADDONS_DIR);
  const filePath = path.join(ADDONS_DIR, `${addon.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(addon, null, 2));
}

export async function getChatSessions(): Promise<ChatSession[]> {
  await ensureDir(CHATS_DIR);
  
  try {
    const files = await fs.readdir(CHATS_DIR);
    const chatFiles = files.filter(file => file.endsWith('.json'));
    
    const sessions: ChatSession[] = [];
    for (const file of chatFiles) {
      try {
        const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf-8');
        const session = JSON.parse(content) as ChatSession;
        sessions.push(session);
      } catch (error) {
        console.error(`Error loading chat ${file}:`, error);
      }
    }
    
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  await ensureDir(CHATS_DIR);
  const filePath = path.join(CHATS_DIR, `${session.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2));
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const filePath = path.join(CHATS_DIR, `${sessionId}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting chat ${sessionId}:`, error);
  }
}

export async function saveUploadedFile(file: File): Promise<string> {
  await ensureDir(UPLOADS_DIR);
  
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  
  return `/uploads/${fileName}`;
}