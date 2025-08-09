'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Zap, FileText, Clock, Download } from 'lucide-react';
// Import the detailed popup component from its separate module rather than
// referencing this file. Without this change, TypeScript incorrectly infers
// the component props and compilation fails.
import AddonInfoPopup from './AddonInfoPopupProps';

type GeneratedAddon = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  fileTypes: string[];
  generatedBy: 'chat' | 'analysis';
  createdAt: number;
  wasOptimal: boolean;
  betterAlternative?: string;
  downloadable: boolean;
};

// Demo-Daten
const mockAddons: GeneratedAddon[] = [
  {
    id: '1',
    name: 'PDF-Analyzer',
    description: 'Analysiert PDF-Dokumente und extrahiert Schlüsselinformationen',
    prompt: 'Analysiere die hochgeladene PDF-Datei und extrahiere die wichtigsten Informationen, Zusammenfassungen und Schlüsselwörter.',
    fileTypes: ['PDF', 'DOC', 'DOCX'],
    generatedBy: 'analysis',
    createdAt: Date.now() - 3600000, // 1 Stunde her
    wasOptimal: true,
    downloadable: true,
  },
  {
    id: '2',
    name: 'Image-Enhancer',
    description: 'Verbessert Bildqualität mit KI-basierten Filtern',
    prompt: 'Verbessere die Bildqualität durch Schärfung, Rauschreduktion und Farboptimierung.',
    fileTypes: ['JPG', 'PNG', 'WEBP'],
    generatedBy: 'chat',
    createdAt: Date.now() - 7200000, // 2 Stunden her
    wasOptimal: false,
    betterAlternative: 'Für Bildbearbeitung wäre die Analyse-KI mit speziellen Vision-Modellen besser geeignet gewesen.',
    downloadable: true,
  },
  {
    id: '3',
    name: 'Code-Reviewer',
    description: 'Überprüft Code auf Bugs und Verbesserungsmöglichkeiten',
    prompt: 'Analysiere den Code auf mögliche Bugs, Sicherheitslücken und Verbesserungen. Gib konkrete Empfehlungen.',
    fileTypes: ['JS', 'TS', 'PY', 'CPP'],
    generatedBy: 'analysis',
    createdAt: Date.now() - 86400000, // 1 Tag her
    wasOptimal: true,
    downloadable: true,
  },
];

export default function AddonHistoryView({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void; 
}) {
  const [selectedAddon, setSelectedAddon] = useState<GeneratedAddon | null>(null);
  const [showAddonInfo, setShowAddonInfo] = useState(false);

  const handleAddonClick = (addon: GeneratedAddon) => {
    setSelectedAddon(addon);
    setShowAddonInfo(true);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    return 'gerade eben';
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
        <div className="w-[600px] max-w-[90vw] h-[70vh] rounded-lg border bg-background shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold">Addon-Verlauf</h3>
              <p className="text-sm text-muted-foreground">
                Von deinen KIs generierte Addons
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Addon-Liste */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {mockAddons.map((addon) => (
                <div
                  key={addon.id}
                  onClick={() => handleAddonClick(addon)}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {addon.generatedBy === 'chat' ? 
                          <Bot className="h-4 w-4 text-blue-500" /> : 
                          <Zap className="h-4 w-4 text-purple-500" />
                        }
                        <span className="font-medium">{addon.name}</span>
                        {!addon.wasOptimal && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                            Suboptimal
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {addon.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(addon.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {addon.fileTypes.slice(0, 3).join(', ')}
                          {addon.fileTypes.length > 3 && ' +mehr'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={addon.generatedBy === 'chat' ? 'default' : 'secondary'} className="text-xs">
                        {addon.generatedBy === 'chat' ? 'Chat' : 'Analyse'}
                      </Badge>
                      {addon.downloadable && (
                        <Download className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Klicke auf ein Addon für Details und Download-Option
            </p>
          </div>
        </div>
      </div>

      {/* Addon Info Popup */}
      <AddonInfoPopup
        addon={selectedAddon}
        open={showAddonInfo}
        onClose={() => {
          setShowAddonInfo(false);
          setSelectedAddon(null);
        }}
      />
    </>
  );
}