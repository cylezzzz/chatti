'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import {
  Film,
  Image as ImageIcon,
  X,
  Sparkles,
  Clock,
  Wand2
} from 'lucide-react';

// ✨ UPM
import UnifiedPromptMask from './UnifiedPromptMask';
import { useUnifiedPrompt, enhancePrompt, buildNegativePrompt } from './useUnifiedPrompt';

interface VideoGenerationPanelProps {
  open: boolean;
  onClose: () => void;
  onVideoGenerated?: (videoUrl: string, description: string) => void;
  selectedImageUrl?: string; // Optional: wird für image2video informativ angezeigt
}

export default function VideoGenerationPanel({
  open,
  onClose,
  onVideoGenerated,
  selectedImageUrl
}: VideoGenerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'text2video' | 'image2video'>(
    selectedImageUrl ? 'image2video' : 'text2video'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // ✨ UPM Integration
  const {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate
  } = useUnifiedPrompt((result, mode) => {
    handleUnifiedGeneration(result, mode);
  });

  const [currentMode, setCurrentMode] = useState<'text2video' | 'image2video'>('text2video');

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleUnifiedGeneration = async (result: any, mode: 'text2video' | 'image2video') => {
    setIsGenerating(true);
    setProgress(0);

    try {
      setCurrentStep('Initialisiere Video-Pipeline …');
      setProgress(10);
      await sleep(700);

      // Prompt aufbereiten (falls du negativePrompt nutzt, hier übergeben)
      const enhancedPrompt = enhancePrompt(result.prompt, result.settings);
      const negativePrompt = buildNegativePrompt(result.settings);
      // (Optional) -> backendCall({ mode, prompt: enhancedPrompt, negativePrompt, settings: result.settings })

      setCurrentStep('Analysiere Prompt/Quellen …');
      setProgress(25);
      await sleep(800);

      setCurrentStep('Generiere Frames …');
      setProgress(55);
      await sleep(1500);

      setCurrentStep('Rendere finale Animation …');
      setProgress(80);
      await sleep(1200);

      setCurrentStep('Exportiere Video …');
      setProgress(95);
      await sleep(600);

      setProgress(100);

      // Mock-URL (hier später echte URL aus Backend)
      const mockVideoUrl =
        mode === 'text2video'
          ? `https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4?t=${Date.now()}`
          : `https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4?t=${Date.now()}`;

      onVideoGenerated?.(mockVideoUrl, `${mode}: ${enhancedPrompt}`);
    } catch (err) {
      console.error('UPM Video Generation Error:', err);
    } finally {
      setIsGenerating(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Video Generation Studio</CardTitle>
                <p className="text-white/80 text-sm">
                  Erstelle Videos aus Text oder animiere Bilder – mit der einheitlichen Prompt-Maske (UPM)
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

        <CardContent className="p-0">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="text2video" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Text → Video
              </TabsTrigger>
              <TabsTrigger value="image2video" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Bild → Video
              </TabsTrigger>
            </TabsList>

            {/* Text → Video */}
            <TabsContent value="text2video" className="p-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Erzeuge ein Video aus einer detaillierten Beschreibung. Alle Parameter (Dauer, FPS, Auflösung,
                  Stil, Negatives etc.) stellst du in der{' '}
                  <span className="font-semibold">Unified Prompt Mask</span> ein.
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                onClick={() => {
                  setCurrentMode('text2video');
                  openPromptMask('text2video', { format: 'video' });
                }}
                disabled={isGenerating}
              >
                <Film className="h-4 w-4 mr-2" />
                Video mit UPM erstellen
              </Button>
            </TabsContent>

            {/* Bild → Video */}
            <TabsContent value="image2video" className="p-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Animiere ein bestehendes Bild (z.&nbsp;B. sanfter Zoom, Parallax, Kamera-Pan). Quelle:
                  {selectedImageUrl ? (
                    <span className="ml-1 font-mono text-xs break-all">{selectedImageUrl}</span>
                  ) : (
                    <span className="ml-1 italic text-slate-600">Kein Bild ausgewählt – wähle zuerst eines im Chat</span>
                  )}
                  . Alle Parameter definierst du in der <span className="font-semibold">Unified Prompt Mask</span>.
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                onClick={() => {
                  setCurrentMode('image2video');
                  openPromptMask('image2video', { format: 'video' });
                }}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Animation mit UPM erstellen
              </Button>
            </TabsContent>
          </Tabs>

          {/* Fortschritt */}
          {isGenerating && (
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm font-medium">{currentStep}</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                <span>{progress}% Complete</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    ETA: {Math.max(1, Math.ceil((100 - (progress || 1)) / 20))} min
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ✨ UPM Modal */}
          <UnifiedPromptMask
            open={isPromptMaskOpen}
            onClose={closePromptMask}
            initialSettings={currentSettings || undefined}
            onSettingsChange={() => {}}
            onGenerate={handleGenerate}
            mode={currentMode}
            title={`${currentMode.toUpperCase()} - Video Generation`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
