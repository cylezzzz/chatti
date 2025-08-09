'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import {
  Image as ImageIcon,
  Wand2,
  Camera,
  X,
  Loader2,
  Info
} from 'lucide-react';

// ✨ UPM
import UnifiedPromptMask from './UnifiedPromptMask';
import { useUnifiedPrompt, enhancePrompt, buildNegativePrompt } from './useUnifiedPrompt';

interface PhotoEditorProps {
  open: boolean;
  onClose: () => void;
  /** Callback mit dem generierten/editierten Bild */
  onImageEdited?: (imageUrl: string, description: string) => void;
  /** Optional: bereits im Chat ausgewähltes Bild */
  selectedImageUrl?: string;
}

type PhotoModes = 'image2image' | 'face_generation';

export default function PhotoEditor({
  open,
  onClose,
  onImageEdited,
  selectedImageUrl
}: PhotoEditorProps) {
  const [currentMode, setCurrentMode] = useState<PhotoModes>('image2image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>('');

  // ✨ UPM Integration
  const {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate
  } = useUnifiedPrompt((result, mode) => {
    handleUnifiedGeneration(result, mode as PhotoModes);
  });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleUnifiedGeneration = async (result: any, mode: PhotoModes) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // 1) Prompt-Aufbereitung
      setStep('Bereite Bearbeitung vor …');
      setProgress(10);
      await sleep(400);

      const enhancedPrompt = enhancePrompt(result.prompt, result.settings);
      const negativePrompt = buildNegativePrompt(result.settings);
      // TODO: Backend-Aufruf hier einsetzen (Comfy/SD + Nodes),
      // inkl. Quelle (selectedImageUrl), Settings (result.settings) und Prompts

      // 2) Pipeline-Schritte simulieren (Mock)
      setStep('Analysiere Eingabebild …');
      setProgress(30);
      await sleep(700);

      setStep('Wende Transformationen an …');
      setProgress(65);
      await sleep(1200);

      setStep('Rendere finales Bild …');
      setProgress(90);
      await sleep(700);

      setProgress(100);

      // 3) Ergebnis zurückgeben (Mock-URL)
      const url = `https://picsum.photos/768/768?edited=1&t=${Date.now()}`;
      onImageEdited?.(url, `${mode}: ${enhancedPrompt}`);
    } catch (err) {
      console.error('UPM Photo Edit Error:', err);
    } finally {
      setIsProcessing(false);
      setStep('');
      setProgress(0);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-[860px] max-w-[95vw] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Photo Editor</CardTitle>
                <p className="text-white/80 text-sm">
                  Bildbearbeitung mit der einheitlichen Prompt-Maske (UPM)
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              title="Schließen"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Bild-Quelle Hinweis */}
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Info className="h-4 w-4 mt-0.5 text-slate-700" />
            <div className="text-sm text-slate-700">
              <div className="font-medium mb-1">Eingabebild</div>
              {selectedImageUrl ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 break-all">
                    Quelle: <span className="font-mono">{selectedImageUrl}</span>
                  </div>
                  <img
                    src={selectedImageUrl}
                    alt="Ausgewähltes Bild"
                    className="max-h-48 rounded-md border border-slate-200 object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="text-slate-600">
                  Kein Bild ausgewählt. Wähle im Chat ein Bild aus (klick auf ein generiertes Bild), dann öffne den Photo Editor erneut.
                </div>
              )}
            </div>
          </div>

          {/* Aktionen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              className="h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              onClick={() => {
                setCurrentMode('image2image');
                openPromptMask('image2image', { format: 'image' });
              }}
              disabled={isProcessing || !selectedImageUrl}
              title={selectedImageUrl ? 'Bild bearbeiten (UPM)' : 'Zuerst ein Bild im Chat auswählen'}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Bild bearbeiten (UPM)
            </Button>

            <Button
              className="h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
              onClick={() => {
                setCurrentMode('face_generation');
                openPromptMask('face_generation', { format: 'image' });
              }}
              disabled={isProcessing || !selectedImageUrl}
              title={selectedImageUrl ? 'Gesicht speichern/verwenden (UPM)' : 'Zuerst ein Bild im Chat auswählen'}
            >
              <Camera className="h-4 w-4 mr-2" />
              Gesicht speichern / verwenden (UPM)
            </Button>
          </div>

          {/* Fortschritt */}
          {isProcessing && (
            <div className="mt-2 rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">{step || 'Verarbeite …'}</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="mt-2 text-xs text-slate-600">{progress}% Complete</div>
            </div>
          )}
        </CardContent>

        {/* ✨ UPM Modal */}
        <UnifiedPromptMask
          open={isPromptMaskOpen}
          onClose={closePromptMask}
          initialSettings={currentSettings || undefined}
          onSettingsChange={() => {}}
          onGenerate={handleGenerate}
          mode={currentMode}
          title={
            currentMode === 'image2image'
              ? 'IMAGE2IMAGE - Bearbeiten'
              : 'FACE_GENERATION - Gesicht speichern/verwenden'
          }
        />
      </Card>
    </div>
  );
}
