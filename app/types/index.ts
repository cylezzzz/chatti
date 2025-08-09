export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  files?: AttachedFile[];
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  addonId?: string;
}

export interface AddonField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'file' | 'checkbox' | 'range';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  defaultValue?: any;
  description?: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  enabled: boolean;
  nsfw: boolean;
  prompt: string;
  fields: AddonField[];
  icon?: string;
  color?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'de';
  apiEndpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streamEnabled: boolean;
}