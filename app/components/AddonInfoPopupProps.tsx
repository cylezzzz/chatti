"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, FileText, Bot, Zap, AlertTriangle } from 'lucide-react';

// Type definition for a generated addon. These mirror the mock/demo structure
// used throughout the application and can be replaced by real data when
// integrating with a backend.
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

// Props for the AddonInfoPopup component. It requires an addon to display,
// a boolean flag to control visibility, and a callback to close the popup.
interface AddonInfoPopupProps {
  addon: GeneratedAddon | null;
  open: boolean;
  onClose: () => void;
}

/**
 * A modal popup that shows detailed information about a generated addon. It
 * displays the addon's name, description, generation method, prompt, file
 * types, and download options. The popup is rendered only when both
 * `open` is true and an `addon` is provided.
 */
export default function AddonInfoPopup({ addon, open, onClose }: AddonInfoPopupProps) {
  const [downloading, setDownloading] = useState(false);

  if (!open || !addon) return null;

  // Simulates the download of an addon. Replace with actual API call
  // to generate and fetch the addon's JSON when backend is implemented.
  const handleDownload = async () => {
    if (!addon.downloadable) return;

    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Downloading addon: ${addon.name}`);
    } finally {
      setDownloading(false);
    }
  };

  // Format timestamp into a localized German date-time string
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-[520px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                {addon.generatedBy === 'chat' ?
                  <Bot className="h-5 w-5 text-blue-500" /> :
                  <Zap className="h-5 w-5 text-purple-500" />
                }
                {addon.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {addon.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant={addon.generatedBy === 'chat' ? 'default' : 'secondary'}>
              {addon.generatedBy === 'chat' ? 'Chat-KI' : 'Analyse-KI'}
            </Badge>
            {addon.wasOptimal ? (
              <Badge variant="default" className="bg-green-600">
                Optimal gewählt
              </Badge>
            ) : (
              <Badge variant="destructive">
                Suboptimal
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {formatTime(addon.createdAt)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* KI-Bewertung */}
          {!addon.wasOptimal && addon.betterAlternative && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-amber-400 mb-1">Bessere Alternative verfügbar</div>
                  <div className="text-amber-300/80">{addon.betterAlternative}</div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verwendeter Prompt
            </h4>
            <div className="p-3 rounded-lg bg-muted text-sm font-mono">
              {addon.prompt}
            </div>
          </div>

          {/* Dateiformate */}
          <div>
            <h4 className="text-sm font-medium mb-2">Unterstützte Dateiformate</h4>
            <div className="flex flex-wrap gap-1">
              {addon.fileTypes.map((type, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Download-Bereich */}
          {addon.downloadable && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Addon als .json herunterladen
                </div>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  {downloading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      Erstelle...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </div>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Das Addon wird automatisch an deine Dateitypen angepasst erstellt.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}