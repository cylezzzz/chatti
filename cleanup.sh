cleanup.sh# Writeora Cleanup - Terminal Befehle
# Führe diese Befehle in deinem Writeora-Projekt-Ordner aus

# 1. BACKUP ERSTELLEN (wichtig!)
echo "🔄 Erstelle Backup..."
cp -r . ../writeora-backup-$(date +%Y%m%d_%H%M%S)
echo "✅ Backup erstellt"

# 2. DUPLIKATE LÖSCHEN
echo "🗑️ Lösche Duplikate..."

# ChatInput Duplikate
rm -f app/components/ChatInputWithSelection.tsx
rm -f app/components/ChatInterfaceWithSelection.tsx

# Message Duplikate  
rm -f app/components/MessageItem.tsx

# Circular Import Problem
rm -f app/components/AddonInfoPopupProps.tsx

# Ungenutzte Komponenten
rm -f app/components/ChatWindow.tsx
rm -f app/types/chat.ts

# Placeholder (nur falls vorhanden)
rm -f app/components/AutomaticSuggestion.tsx

echo "✅ Duplikate gelöscht"

# 3. NEUE DATEIEN ERSTELLEN
echo "📝 Erstelle bereinigte Dateien..."

# Erstelle app/types/index.ts (überschreiben)
cat > app/types/index.ts << 'EOF'
// app/types/index.ts - Vereinheitlichte Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  files?: AttachedFile[];
  
  // Erweiterte Properties für bessere UX
  selectedMedia?: string[];
  contentType?: 'text' | 'image' | 'video' | 'code' | 'mixed';
  addon?: string; // Welches Addon diese Message generiert hat
  metadata?: {
    processing?: boolean;
    error?: string;
  };
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  
  // Für Media-Komponenten
  alt?: string; // für images
  poster?: string; // für videos
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  addonId?: string;
  
  // Session-Kontext
  activeModel?: string;
  systemPrompt?: string;
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
  
  // Neue Properties für besseres Addon-System
  trigger?: {
    keywords?: string[];
    fileTypes?: string[];
    automatic?: boolean;
  };
  
  ui?: {
    quickActions?: Array<{
      id: string;
      label: string;
      prompt: string;
      icon?: string;
    }>;
  };
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

// Für Media-Komponenten - kompatibel mit bestehendem Code
export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Legacy-Support für bestehende Komponenten
export type ChatMessage = Message;
export type ChatRole = Message['role'];
EOF

echo "✅ app/types/index.ts aktualisiert"

# 4. IMPORTS KORRIGIEREN
echo "🔧 Korrigiere Imports..."

# In MessageList.tsx
if [ -f "app/components/MessageList.tsx" ]; then
    sed -i.bak 's/SelectableMediaMessage/MessageRenderer/g' app/components/MessageList.tsx
    sed -i.bak 's/from "\.\/SelectableMediaMessage"/from "\.\/MessageRenderer"/g' app/components/MessageList.tsx
    rm -f app/components/MessageList.tsx.bak
    echo "  ✅ MessageList.tsx aktualisiert"
fi

# In ChatInterface.tsx  
if [ -f "app/components/ChatInterface.tsx" ]; then
    sed -i.bak 's/ChatInputWithSelection/ChatInput/g' app/components/ChatInterface.tsx
    sed -i.bak 's/from "\.\/ChatInputWithSelection"/from "\.\/ChatInput"/g' app/components/ChatInterface.tsx
    rm -f app/components/ChatInterface.tsx.bak
    echo "  ✅ ChatInterface.tsx aktualisiert"
fi

# 5. VALIDIERUNG
echo "✅ Überprüfe Projekt..."

# Prüfe ob wichtige Dateien existieren
REQUIRED_FILES=(
    "app/components/ChatInput.tsx"
    "app/components/ChatInterface.tsx" 
    "app/components/MessageList.tsx"
    "app/types/index.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file existiert"
    else
        echo "  ❌ FEHLER: $file fehlt!"
    fi
done

# 6. ABSCHLUSS
echo ""
echo "🎉 Writeora Cleanup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "  1. npm run dev"
echo "  2. Teste Chat-Funktionalität im Browser"
echo "  3. Bei Problemen: Backup verwenden"
echo ""
echo "💡 Hinweis: Du musst noch die neuen Komponenten erstellen:"
echo "  - app/components/MessageRenderer.tsx"
echo "  - Aktualisierte app/components/ChatInput.tsx"
echo "  - Bereinigte app/components/AddonInfoPopup.tsx"
echo ""
echo "🚀 Basis ist bereit für weitere Entwicklung!"