// app/types/unified.ts - Einheitliche Typen
export interface UnifiedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  
  // Optional: Erweiterte Inhalte
  media?: MediaAttachment[];
  selectedMedia?: string[];
  addon?: string; // Welches Addon diese Message generiert hat
  metadata?: {
    processing?: boolean;
    error?: string;
    contentType?: 'text' | 'image' | 'video' | 'code' | 'mixed';
  };
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  size?: number;
  
  // Typ-spezifische Eigenschaften
  alt?: string; // für images
  poster?: string; // für videos
  mimeType?: string;
  
  // Verarbeitungsmetadaten
  processedBy?: string; // Addon ID
  originalUrl?: string; // Falls transformiert
}

export interface ChatSession {
  id: string;
  title: string;
  messages: UnifiedMessage[];
  createdAt: number;
  updatedAt: number;
  
  // Session-spezifische Einstellungen
  activeModel?: string;
  systemPrompt?: string;
  context?: Record<string, any>;
}

// Simplified Addon Structure
export interface Addon {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  
  // Verhalten
  trigger: {
    keywords?: string[];
    fileTypes?: string[];
    automatic?: boolean; // Wird automatisch bei passenden Inhalten ausgelöst
  };
  
  // KI-Instruktionen
  systemPrompt: string;
  responseTemplate?: string;
  
  // UI-Konfiguration
  ui?: {
    icon?: string;
    color?: string;
    quickActions?: QuickAction[];
  };
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}