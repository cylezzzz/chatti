'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import ThinkingOverlay from './ThinkingOverlay';

type ModelStatus = {
  model: string;
  installed: boolean;
  downloadUrl?: string;
  path?: string | null;
};

type StartupState = {
  chat: ModelStatus | null;
  analysis: ModelStatus | null;
  loading: boolean;
  thinking: boolean;
  decisionText: string;
  uploading: boolean;
  uploadInfo: string | null;
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
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetModel, setTargetModel] = useState<'chat' | 'analysis' | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const def = await fetch('/app/settings/default_config.json').then(r => r.json()).catch(() => null);
      const chatModel = def?.chat_ai?.model ?? 'llama3.1-70b';
      const analysisModel = def?.analysis_ai?.model ?? 'deepseek-coder-v2';

      const [chat, analysis] = await Promise.all([
        checkModel(chatModel),
        checkModel(analysisModel),
      ]);

      setState(s => ({ ...s, chat, analysis, loading: false }));
    })();
  }, [open]);

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
      };
    } catch {
      return {
        model,
        installed: false,
        downloadUrl: `https://ollama.com/library/${encodeURIComponent(model.split(':')[0])}`,
        path: null,
      };
    }
  }

  const anyMissing =
    !state.loading &&
    ((state.chat && !state.chat.installed) || (state.analysis && !state.analysis.installed));

  const startAnalysis = async () => {
    setState(s => ({
      ...s,
      thinking: true,
      decisionText:
        'Modelle gesetzt. Prompt-Analyse-KI bereit. Agenten werden bei Bedarf automatisch gewählt.',
    }));
    setTimeout(() => {
      setState(s => ({ ...s, thinking: false }));
      onClose();
    }, 1200);
  };

  const triggerLocalSearch = (slot: 'chat' | 'analysis') => {
    setTargetModel(slot);
    fileInputRef.current?.click();
  };

  const onLocalFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0 || !targetModel) return;
    setState(s => ({ ...s, uploading: true, uploadInfo: `Übertrage ${files.length} Datei(en)…` }));

    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const modelName =
        targetModel === 'chat' ? state.chat?.model ?? 'chat-model' : state.analysis?.model ?? 'analysis-model';
      fd.append('slot', targetModel);
      fd.append('model', modelName);

      const res = await fetch('/api/models/registerLocal', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload fehlgeschlagen (${res.status})`);

      const updated = await checkModel(modelName);
      setState(s => ({
        ...s,
        [targetModel]: updated,
        uploadInfo: 'Lokal hinzugefügt.',
      }) as StartupState);
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
      <div className="w-[560px] max-w-[92vw] rounded-lg border bg-background p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">🔍 Modell-Check</h3>

        {/* verstecktes Input für „Auf PC suchen“ */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          // @ts-ignore Chromium: Verzeichnisse wählen
          webkitdirectory="true"
          className="hidden"
          onChange={(e) => onLocalFilesPicked(e.target.files)}
        />

        {state.loading ? (
          <p className="text-sm text-muted-foreground">Prüfe Standardmodelle…</p>
        ) : (
          <div className="space-y-3">
            <ModelRow
              label="Chat-KI"
              status={state.chat!}
              onLocal={() => triggerLocalSearch('chat')}
            />
            <ModelRow
              label="Analyse-KI"
              status={state.analysis!}
              onLocal={() => triggerLocalSearch('analysis')}
            />
            {anyMissing && (
              <p className="text-xs text-muted-foreground">
                Mindestens ein Modell ist nicht installiert. Du kannst den Download starten oder{' '}
                <span className="font-medium">auf deinem PC nach lokalen Dateien/Ordnern suchen</span>.
              </p>
            )}
            {state.uploading && (
              <div className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {state.uploadInfo ?? 'Übertrage…'}
              </div>
            )}
            {!state.uploading && state.uploadInfo && (
              <div className="text-xs px-2 py-1 rounded bg-zinc-700/30 text-zinc-200 border border-zinc-700/50">
                {state.uploadInfo}
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onClose}>
                Später
              </Button>
              <Button onClick={startAnalysis} disabled={state.loading || state.uploading}>
                Weiter
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
}: {
  label: string;
  status: ModelStatus;
  onLocal: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md border">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground break-all">{status.model}</div>
        {status.path && (
          <div className="text-[11px] text-muted-foreground/80 break-all">Pfad: {status.path}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {status.installed ? (
          <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Installiert
          </span>
        ) : (
          <>
            <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Fehlt
            </span>
            {status.downloadUrl && (
              <a href={status.downloadUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                Download
              </a>
            )}
            <button
              className="text-xs px-2 py-1 rounded border hover:bg-accent"
              onClick={onLocal}
              title="Lokale Dateien/Ordner wählen"
            >
              Auf&nbsp;PC&nbsp;suchen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
