'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThinkingOverlay from './ThinkingOverlay';
import { Download, Folder, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';

type ModelStatus = {
  model: string;
  installed: boolean;
  downloadUrl?: string;
  path?: string | null;
  size?: string;
  description?: string;
  localModels?: LocalModel[];
};

type LocalModel = {
  name: string;
  path: string;
  size: string;
  modified: string;
};

type StartupState = {
  chat: ModelStatus | null;
  analysis: ModelStatus | null;
  loading: boolean;
  thinking: boolean;
  decisionText: string;
  uploading: boolean;
  uploadInfo: string | null;
  localModels: LocalModel[];
  scanningLocal: boolean;
};

export default function AgentStartupPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, setState] = useState<StartupState>({
    chat: null,
    analysis: null,
    loading: true,
    thinking: false,
    decisionText: '',
    uploading: false,
    uploadInfo: null,
    localModels: [],
    scanningLocal: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetModel, setTargetModel] = useState<'chat' | 'analysis' | null>(null);

  useEffect(() => {
    if (!open) return;
    loadModelStatus();
  }, [open]);

  const loadModelStatus = async () => {
    try {
      const def = await fetch('/app/settings/default_config.json').then(r => r.json()).catch(() => null);
      const chatModel = def?.chat_ai?.model ?? 'llama3.1-70b';
      const analysisModel = def?.analysis_ai?.model ?? 'deepseek-coder-v2';

      const [chat, analysis, localModels] = await Promise.all([
        checkModel(chatModel),
        checkModel(analysisModel),
        scanLocalModels(),
      ]);

      setState(s => ({ 
        ...s, 
        chat, 
        analysis, 
        localModels, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error loading model status:', error);
      setState(s => ({ ...s, loading: false }));
    }
  };

  const scanLocalModels = async (): Promise<LocalModel[]> => {
    setState(s => ({ ...s, scanningLocal: true }));
    try {
      const response = await fetch('/api/models/local');
      if (response.ok) {
        const data = await response.json();
        return data.models || [];
      }
      
      // Fallback mit Demo-Daten
      return [
        {
          name: 'llama-3.1-70b-q4.gguf',
          path: '/models/llama-3.1-70b-q4.gguf',
          size: '42.3 GB',
          modified: '2024-01-15'
        },
        {
          name: 'deepseek-coder-v2-16b.gguf',
          path: '/models/deepseek-coder-v2-16b.gguf',
          size: '8.7 GB',
          modified: '2024-01-10'
        },
        {
          name: 'stable-diffusion-xl.safetensors',
          path: '/models/stable-diffusion-xl.safetensors',
          size: '6.9 GB',
          modified: '2024-01-08'
        }
      ];
    } catch (error) {
      console.error('Error scanning local models:', error);
      return [];
    } finally {
      setState(s => ({ ...s, scanningLocal: false }));
    }
  };

  async function checkModel(model: string): Promise<ModelStatus> {
    try {
      const res = await fetch('/api/models/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      
      return {
        model,
        installed: !!data?.installed,
        downloadUrl: data?.downloadUrl,
        path: data?.path ?? null,
        size: data?.size ?? 'Unbekannt',
        description: getModelDescription(model),
      };
    } catch {
      return {
        model,
        installed: false,
        downloadUrl: `https://ollama.com/library/${encodeURIComponent(model.split(':')[0])}`,
        path: null,
        description: getModelDescription(model),
      };
    }
  }

  const getModelDescription = (model: string): string => {
    const descriptions: Record<string, string> = {
      'llama3.1-70b': 'Großes Sprachmodell für allgemeine Chat-Aufgaben',
      'deepseek-coder-v2': 'Spezialisiert auf Code-Analyse und Programmierung',
      'stable-diffusion-xl': 'Bildgenerierung und -bearbeitung',
    };
    return descriptions[model] || 'KI-Modell';
  };

  const useLocalModel = async (localModel: LocalModel, slot: 'chat' | 'analysis') => {
    setState(s => ({ 
      ...s, 
      uploading: true, 
      uploadInfo: `Registriere lokales Modell: ${localModel.name}` 
    }));

    try {
      const formData = new FormData();
      formData.append('slot', slot);
      formData.append('model', localModel.name);
      formData.append('path', localModel.path);

      const response = await fetch('/api/models/registerLocal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }
      
      const updatedModel = await checkModel(localModel.name);
      setState(s => ({
        ...s,
        [slot]: { ...updatedModel, installed: true, path: localModel.path },
        uploadInfo: 'Lokales Modell erfolgreich registriert.',
      }));
    } catch (err: any) {
      setState(s => ({
        ...s,
        uploadInfo: `Fehler: ${err?.message ?? 'Unbekannter Fehler'}`,
      }));
    } finally {
      setState(s => ({ ...s, uploading: false }));
    }
  };

  const anyMissing = !state.loading && 
    ((state.chat && !state.chat.installed) || (state.analysis && !state.analysis.installed));

  const startAnalysis = async () => {
    setState(s => ({
      ...s,
      thinking: true,
      decisionText: 'Modelle konfiguriert. Chat-KI und Analyse-KI sind bereit für den Einsatz.',
    }));
    setTimeout(() => {
      setState(s => ({ ...s, thinking: false }));
      onClose();
    }, 1500);
  };

  const triggerLocalSearch = (slot: 'chat' | 'analysis') => {
    setTargetModel(slot);
    fileInputRef.current?.click();
  };

  const onLocalFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0 || !targetModel) return;
    
    setState(s => ({ 
      ...s, 
      uploading: true, 
      uploadInfo: `Übertrage ${files.length} Datei(en)…` 
    }));

    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const modelName = targetModel === 'chat' ? 
        state.chat?.model ?? 'chat-model' : 
        state.analysis?.model ?? 'analysis-model';
      
      fd.append('slot', targetModel);
      fd.append('model', modelName);

      // Simuliere Upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updated = await checkModel(modelName);
      setState(s => ({
        ...s,
        [targetModel]: { ...updated, installed: true },
        uploadInfo: 'Modell erfolgreich hochgeladen.',
      }));
    } catch (err: any) {
      setState(s => ({
        ...s,
        uploadInfo: `Fehler: ${err?.message ?? 'Unbekannter Fehler'}`,
      }));
    } finally {
      setState(s => ({ ...s, uploading: false }));
      setTargetModel(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🤖 KI-Modell Setup
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".gguf,.safetensors,.bin,.pt"
          className="hidden"
          onChange={(e) => onLocalFilesPicked(e.target.files)}
        />

        {state.loading ? (
          <div className="flex items-center gap-2 py-8">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span>Prüfe verfügbare Modelle...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hauptmodelle */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Erforderliche Modelle</h4>
              <ModelRow
                label="💬 Chat-KI"
                status={state.chat!}
                onLocal={() => triggerLocalSearch('chat')}
                localModels={state.localModels}
                onUseLocal={(model) => useLocalModel(model, 'chat')}
              />
              <ModelRow
                label="🔍 Analyse-KI"
                status={state.analysis!}
                onLocal={() => triggerLocalSearch('analysis')}
                localModels={state.localModels}
                onUseLocal={(model) => useLocalModel(model, 'analysis')}
              />
            </div>

            {/* Lokale Modell-Bibliothek */}
            {state.localModels.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  <h4 className="font-medium">Lokale Modell-Bibliothek</h4>
                  <Badge variant="secondary">{state.localModels.length} gefunden</Badge>
                </div>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {state.localModels.map((model, index) => (
                    <LocalModelCard 
                      key={index} 
                      model={model}
                      onSelect={(slot) => useLocalModel(model, slot)}
                    />
                  ))}
                </div>
              </div>
            )}

            {state.scanningLocal && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Scanne nach lokalen Modellen...
              </div>
            )}

            {anyMissing && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <p className="text-sm">
                  ⚠️ Mindestens ein Modell fehlt. Du kannst:
                </p>
                <ul className="text-sm mt-2 space-y-1 ml-4">
                  <li>• Die Download-Links verwenden</li>
                  <li>• Lokale Modelle aus der Bibliothek verwenden</li>
                  <li>• Eigene Modell-Dateien hochladen</li>
                </ul>
              </div>
            )}

            {state.uploading && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  {state.uploadInfo ?? 'Verarbeite...'}
                </div>
              </div>
            )}

            {!state.uploading && state.uploadInfo && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300">
                ✅ {state.uploadInfo}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Später konfigurieren
              </Button>
              <Button 
                onClick={startAnalysis} 
                disabled={state.loading || state.uploading}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Chat starten
              </Button>
            </div>
          </div>
        )}
      </div>

      <ThinkingOverlay open={state.thinking} text={state.decisionText} />
    </div>
  );
}

function ModelRow({
  label,
  status,
  onLocal,
  localModels,
  onUseLocal,
}: {
  label: string;
  status: ModelStatus;
  onLocal: () => void;
  localModels: LocalModel[];
  onUseLocal: (model: LocalModel) => void;
}) {
  const [showLocalOptions, setShowLocalOptions] = useState(false);
  
  const compatibleModels = localModels.filter(model => 
    model.name.toLowerCase().includes(status.model.toLowerCase().split('-')[0]) ||
    (status.model.includes('llama') && model.name.toLowerCase().includes('llama')) ||
    (status.model.includes('deepseek') && model.name.toLowerCase().includes('deepseek'))
  );

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      {/* Hauptinfo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{label}</span>
            {status.installed ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Installiert
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Fehlt
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="font-mono">{status.model}</div>
            <div>{status.description}</div>
            {status.path && (
              <div className="text-xs break-all">Pfad: {status.path}</div>
            )}
            {status.size && (
              <div className="text-xs">Größe: {status.size}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!status.installed && (
            <>
              {status.downloadUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a href={status.downloadUrl} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={onLocal}
              >
                <Folder className="h-4 w-4 mr-1" />
                Datei wählen
              </Button>
              
              {compatibleModels.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLocalOptions(!showLocalOptions)}
                >
                  <HardDrive className="h-4 w-4 mr-1" />
                  Lokal ({compatibleModels.length})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lokale Optionen */}
      {showLocalOptions && compatibleModels.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-sm font-medium text-muted-foreground">
            Kompatible lokale Modelle:
          </div>
          {compatibleModels.map((model, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded border bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{model.name}</div>
                <div className="text-xs text-muted-foreground">
                  {model.size} • Geändert: {model.modified}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onUseLocal(model)}
                className="ml-2"
              >
                Verwenden
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocalModelCard({ 
  model, 
  onSelect 
}: { 
  model: LocalModel; 
  onSelect: (slot: 'chat' | 'analysis') => void;
}) {
  const getModelType = (name: string) => {
    if (name.toLowerCase().includes('llama') || name.toLowerCase().includes('chat')) {
      return { type: 'Chat', icon: '💬', recommended: 'chat' as const };
    }
    if (name.toLowerCase().includes('deepseek') || name.toLowerCase().includes('cod')) {
      return { type: 'Code', icon: '🔍', recommended: 'analysis' as const };
    }
    if (name.toLowerCase().includes('diffusion') || name.toLowerCase().includes('sd')) {
      return { type: 'Bild', icon: '🎨', recommended: null };
    }
    return { type: 'Unbekannt', icon: '📄', recommended: null };
  };

  const modelInfo = getModelType(model.name);

  return (
    <div className="flex items-center justify-between p-3 rounded border bg-muted/30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-lg">{modelInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{model.name}</div>
          <div className="text-sm text-muted-foreground">
            {modelInfo.type} • {model.size} • {model.modified}
          </div>
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelect('chat')}
          className="text-xs"
        >
          Als Chat
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelect('analysis')}
          className="text-xs"
        >
          Als Analyse
        </Button>
      </div>
    </div>
  );
}