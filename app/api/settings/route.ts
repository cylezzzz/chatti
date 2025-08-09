import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

// Default settings
const defaultSettings = {
  theme: 'dark',
  language: 'de',
  fontSize: 'medium',
  sidebarCollapsed: false,
  autoSave: true,
  autoSaveInterval: 5,
  confirmBeforeDelete: true,
  rememberLastSession: true,
  enableKeyboardShortcuts: true,
  defaultChatModel: 'llama3.1-70b',
  defaultAnalysisModel: 'deepseek-coder-v2',
  streamingEnabled: true,
  maxTokens: 2048,
  temperature: 0.7,
  autoSelectBestAgent: true,
  enableNotifications: true,
  notifyOnTaskComplete: true,
  notifyOnError: true,
  playSounds: true,
  soundVolume: 50,
  enableReminders: true,
  dailyBackupReminder: true,
  weeklyCleanupReminder: true,
  modelUpdateReminder: true,
  logConversations: true,
  encryptStorage: false,
  clearHistoryOnExit: false,
  requirePasswordForSensitive: false,
  maxConcurrentTasks: 3,
  enableGPUAcceleration: true,
  limitMemoryUsage: true,
  memoryLimitGB: 8,
  enableBetaFeatures: false,
  debugMode: false,
  customPrompts: true,
  apiEndpoint: 'http://localhost:11434'
};

async function ensureDataDir() {
  const dataDir = path.dirname(SETTINGS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      const settings = { ...defaultSettings, ...JSON.parse(data) };
      return NextResponse.json({ settings });
    } catch {
      // File doesn't exist, return defaults
      return NextResponse.json({ settings: defaultSettings });
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { settings } = await request.json();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings data required' },
        { status: 400 }
      );
    }

    await ensureDataDir();
    
    // Merge with defaults to ensure all properties exist
    const mergedSettings = { ...defaultSettings, ...settings };
    
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(mergedSettings, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}