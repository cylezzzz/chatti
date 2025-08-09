// app/lib/addons/manager.ts
import { Addon } from '@/app/types/unified';

export class AddonManager {
  private addons: Map<string, Addon> = new Map();
  private activeAddons: Set<string> = new Set();

  constructor() {
    this.loadDefaultAddons();
  }

  // Lade Standard-Addons
  private loadDefaultAddons() {
    const defaultAddons: Addon[] = [
      {
        id: 'text2image',
        name: 'Text → Bild',
        description: 'Erstelle Bilder aus Textbeschreibungen',
        version: '1.0.0',
        enabled: true,
        trigger: {
          keywords: ['bild', 'erstelle', 'generiere', 'zeichne', 'male', 'image'],
          automatic: true
        },
        systemPrompt: `Du bist ein Experte für Bildgenerierung. 
        Wenn der Nutzer ein Bild erstellen möchte:
        1. Analysiere die Beschreibung
        2. Erstelle einen detaillierten Prompt für Stable Diffusion
        3. Gib Verbesserungsvorschläge
        
        Antworte im Format:
        **Bildprompt:** [Detaillierter englischer Prompt]
        **Stil:** [Empfohlener Stil]
        **Einstellungen:** [Technische Parameter]`,
        ui: {
          icon: '🎨',
          color: 'purple',
          quickActions: [
            { id: 'portrait', label: 'Portrait', prompt: 'Erstelle ein realistisches Portrait von:', icon: '👤' },
            { id: 'landscape', label: 'Landschaft', prompt: 'Erstelle eine schöne Landschaft:', icon: '🏞️' },
            { id: 'abstract', label: 'Abstrakt', prompt: 'Erstelle ein abstraktes Kunstwerk:', icon: '🎭' }
          ]
        }
      },
      {
        id: 'image2image',
        name: 'Bild bearbeiten',
        description: 'Verändere und verbessere vorhandene Bilder',
        version: '1.0.0',
        enabled: true,
        trigger: {
          keywords: ['bearbeite', 'verändere', 'verbessere', 'edit', 'modify'],
          fileTypes: ['image/jpeg', 'image/png', 'image/webp'],
          automatic: false
        },
        systemPrompt: `Du bist ein Experte für Bildbearbeitung.
        Analysiere das hochgeladene Bild und die gewünschten Änderungen.
        
        Gib konkrete Anweisungen für:
        1. Welche Tools/Filter zu verwenden
        2. Schritt-für-Schritt Bearbeitungsanleitung
        3. Technische Parameter
        
        Wenn möglich, erstelle auch einen img2img Prompt für KI-basierte Bearbeitung.`,
        ui: {
          icon: '✏️',
          color: 'blue',
          quickActions: [
            { id: 'enhance', label: 'Verbessern', prompt: 'Verbessere die Bildqualität:', icon: '⚡' },
            { id: 'style', label: 'Stil ändern', prompt: 'Ändere den Stil zu:', icon: '🎨' },
            { id: 'remove', label: 'Objekt entfernen', prompt: 'Entferne aus dem Bild:', icon: '🗑️' }
          ]
        }
      },
      {
        id: 'code-analyzer',
        name: 'Code Analyzer',
        description: 'Analysiere und verbessere Code',
        version: '1.0.0',
        enabled: true,
        trigger: {
          keywords: ['code', 'programmier', 'debug', 'refactor', 'analyze'],
          fileTypes: ['text/javascript', 'text/typescript', 'text/python', 'text/plain'],
          automatic: true
        },
        systemPrompt: `Du bist ein Senior Software Developer mit Expertise in:
        - Code Review und Best Practices
        - Debugging und Performance Optimierung  
        - Sicherheitsanalyse
        - Refactoring
        
        Analysiere den Code systematisch:
        1. **Funktionalität:** Was macht der Code?
        2. **Probleme:** Bugs, Performance, Sicherheit
        3. **Verbesserungen:** Konkrete Vorschläge mit Code-Beispielen
        4. **Best Practices:** Standards und Konventionen`,
        ui: {
          icon: '💻',
          color: 'green',
          quickActions: [
            { id: 'review', label: 'Code Review', prompt: 'Führe ein Code Review durch:', icon: '🔍' },
            { id: 'optimize', label: 'Optimieren', prompt: 'Optimiere diesen Code für Performance:', icon: '⚡' },
            { id: 'security', label: 'Sicherheit', prompt: 'Prüfe auf Sicherheitslücken:', icon: '🔒' }
          ]
        }
      }
    ];

    defaultAddons.forEach(addon => {
      this.addons.set(addon.id, addon);
      if (addon.enabled) {
        this.activeAddons.add(addon.id);
      }
    });
  }

  // Addon-Matching basierend auf Kontext
  suggestAddons(text: string, files: File[] = []): Addon[] {
    const suggestions: { addon: Addon; score: number }[] = [];

    for (const addon of this.addons.values()) {
      if (!addon.enabled) continue;

      let score = 0;

      // Keyword-Matching
      if (addon.trigger.keywords) {
        const textLower = text.toLowerCase();
        for (const keyword of addon.trigger.keywords) {
          if (textLower.includes(keyword.toLowerCase())) {
            score += 10;
          }
        }
      }

      // File-Type-Matching
      if (addon.trigger.fileTypes && files.length > 0) {
        for (const file of files) {
          if (addon.trigger.fileTypes.includes(file.type)) {
            score += 15;
          }
        }
      }

      // Automatische Aktivierung bei hohem Score
      if (addon.trigger.automatic && score >= 10) {
        score += 5;
      }

      if (score > 0) {
        suggestions.push({ addon, score });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.addon);
  }

  // Addon aktivieren/deaktivieren
  toggleAddon(addonId: string, enabled: boolean): boolean {
    const addon = this.addons.get(addonId);
    if (!addon) return false;

    addon.enabled = enabled;
    if (enabled) {
      this.activeAddons.add(addonId);
    } else {
      this.activeAddons.delete(addonId);
    }

    return true;
  }

  // Neues Addon registrieren
  registerAddon(addon: Addon): boolean {
    if (this.addons.has(addon.id)) {
      console.warn(`Addon ${addon.id} already exists`);
      return false;
    }

    this.addons.set(addon.id, addon);
    if (addon.enabled) {
      this.activeAddons.add(addon.id);
    }

    return true;
  }

  // Addon entfernen
  removeAddon(addonId: string): boolean {
    const removed = this.addons.delete(addonId);
    this.activeAddons.delete(addonId);
    return removed;
  }

  // Alle Addons abrufen
  getAllAddons(): Addon[] {
    return Array.from(this.addons.values());
  }

  // Aktive Addons abrufen
  getActiveAddons(): Addon[] {
    return Array.from(this.activeAddons)
      .map(id => this.addons.get(id))
      .filter((addon): addon is Addon => addon !== undefined);
  }

  // Addon by ID
  getAddon(id: string): Addon | undefined {
    return this.addons.get(id);
  }

  // Addon aus JSON laden
  async loadAddonFromJson(jsonString: string): Promise<boolean> {
    try {
      const addonData = JSON.parse(jsonString);
      
      // Validierung
      if (!this.validateAddon(addonData)) {
        throw new Error('Invalid addon format');
      }

      return this.registerAddon(addonData);
    } catch (error) {
      console.error('Failed to load addon from JSON:', error);
      return false;
    }
  }

  // Addon validieren
  private validateAddon(addon: any): addon is Addon {
    return (
      typeof addon === 'object' &&
      typeof addon.id === 'string' &&
      typeof addon.name === 'string' &&
      typeof addon.description === 'string' &&
      typeof addon.version === 'string' &&
      typeof addon.enabled === 'boolean' &&
      typeof addon.systemPrompt === 'string' &&
      addon.trigger &&
      typeof addon.trigger === 'object'
    );
  }

  // Export Addon als JSON
  exportAddon(addonId: string): string | null {
    const addon = this.addons.get(addonId);
    if (!addon) return null;

    return JSON.stringify(addon, null, 2);
  }

  // Statistiken
  getStats() {
    return {
      total: this.addons.size,
      active: this.activeAddons.size,
      categories: this.getCategoriesStats()
    };
  }

  private getCategoriesStats() {
    const categories: Record<string, number> = {};
    
    for (const addon of this.addons.values()) {
      // Kategorisierung basierend auf Keywords
      const mainKeyword = addon.trigger.keywords?.[0] || 'other';
      categories[mainKeyword] = (categories[mainKeyword] || 0) + 1;
    }
    
    return categories;
  }
}

// Singleton Instance
export const addonManager = new AddonManager();

// React Hook für Addon-Management
import { useState, useEffect } from 'react';

export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAddons = () => {
      setAddons(addonManager.getAllAddons());
      setLoading(false);
    };

    loadAddons();
  }, []);

  const toggleAddon = (id: string, enabled: boolean) => {
    if (addonManager.toggleAddon(id, enabled)) {
      setAddons(addonManager.getAllAddons());
    }
  };

  const suggestAddons = (text: string, files: File[] = []) => {
    return addonManager.suggestAddons(text, files);
  };

  const registerAddon = (addon: Addon) => {
    if (addonManager.registerAddon(addon)) {
      setAddons(addonManager.getAllAddons());
      return true;
    }
    return false;
  };

  const removeAddon = (id: string) => {
    if (addonManager.removeAddon(id)) {
      setAddons(addonManager.getAllAddons());
      return true;
    }
    return false;
  };

  return {
    addons,
    loading,
    toggleAddon,
    suggestAddons,
    registerAddon,
    removeAddon,
    stats: addonManager.getStats()
  };
}

// Utility Functions
export function createAddonFromTemplate(
  id: string,
  name: string,
  description: string,
  systemPrompt: string,
  keywords: string[] = [],
  fileTypes: string[] = []
): Addon {
  return {
    id,
    name,
    description,
    version: '1.0.0',
    enabled: true,
    trigger: {
      keywords,
      fileTypes,
      automatic: keywords.length > 0
    },
    systemPrompt,
    ui: {
      icon: '🔧',
      color: 'gray'
    }
  };
}

// Addon-Ausführung Context
export interface AddonExecutionContext {
  addon: Addon;
  userInput: string;
  files: File[];
  selectedMedia: string[];
  sessionHistory: any[];
}

export function prepareAddonContext(context: AddonExecutionContext): string {
  const parts = [
    `[ADDON: ${context.addon.name}]`,
    `User Input: ${context.userInput}`,
  ];

  if (context.files.length > 0) {
    parts.push(`Uploaded Files: ${context.files.map(f => f.name).join(', ')}`);
  }

  if (context.selectedMedia.length > 0) {
    parts.push(`Selected Media: ${context.selectedMedia.length} items`);
  }

  if (context.sessionHistory.length > 0) {
    parts.push(`Previous Context: ${context.sessionHistory.length} messages`);
  }

  return parts.join('\n');
}