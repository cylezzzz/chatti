'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Crop,
  Image as ImageIcon,
  MousePointerSquare,
  Sparkles,
  ScanFace,
  X,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

// ✨ UPM
import UnifiedPromptMask from './UnifiedPromptMask';
import { useUnifiedPrompt, enhancePrompt, buildNegativePrompt } from './useUnifiedPrompt';

interface RegionSelectionToolProps {
  open: boolean;
  onClose: () => void;
  /** Quellbild – ideal: vom Chat markiert */
  selectedImageUrl?: string;
  /** Callback nach Verarbeitung (z. B. neue Bild-URL/Masken-URL) */
  onRegionProcessed?: (result: {
    imageUrl?: string;
    maskUrl?: string;
    region: { x: number; y: number; width: number; height: number; invert: boolean };
    description: string;
    mode: 'region_processing' | 'face_generation' | 'image2image';
  }) => void;
}

/** UI-interner Regionstyp */
type Region = { x: number; y: number; width: number; height: number; invert: boolean };

type UpmMode = 'region_processing' | 'image2image' | 'face_generation';

export default function RegionSelectionTool({
  open,
  onClose,
  selectedImageUrl,
  onRegionProcessed
}: RegionSelectionToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [region, setRegion] = useState<Region>({ x: 0, y: 0, width: 0, height: 0, invert: false });
  const [showMaskPreview, setShowMaskPreview] = useState(true);

  // Processing / Progress
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
    handleUnifiedGeneration(result, mode as UpmMode);
  });
  const [currentMode, setCurrentMode] = useState<UpmMode>('region_processing');

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Bild laden & Canvas dimensionieren */
  useEffect(() => {
    if (!selectedImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImageUrl;
    img.onload = () => {
      setNaturalSize({ w: img.width, h: img.height });
      setImgLoaded(true);
      // Displaygröße: maximal 780px Breite oder 70vh Höhe
      const maxW = 780;
      const maxH = Math.floor(window.innerHeight * 0.7);
      let w = img.width;
      let h = img.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w = Math.floor(w * scale);
      h = Math.floor(h * scale);
      setDisplaySize({ w, h });
      // initiale leere Region
      setRegion((r) => ({ ...r, x: Math.floor(w * 0.2), y: Math.floor(h * 0.2), width: Math.floor(w * 0.6), height: Math.floor(h * 0.6) }));
      drawOverlay({ w, h }, { x: Math.floor(w * 0.2), y: Math.floor(h * 0.2), width: Math.floor(w * 0.6), height: Math.floor(h * 0.6), invert: false }, true);
    };
  }, [selectedImageUrl]);

  /** Overlay zeichnen */
  const drawOverlay = (size = displaySize, reg = region, mask = showMaskPreview) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear
    ctx.clearRect(0, 0, size.w, size.h);
    // Halbtransparente Maske
    if (mask) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, size.w, size.h);
      // "Loch" für die Region (invert=false) oder invertierte Darstellung
      ctx.save();
      ctx.globalCompositeOperation = reg.invert ? 'source-over' : 'destination-out';
      ctx.fillStyle = reg.invert ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,1)';
      ctx.fillRect(reg.x, reg.y, reg.width, reg.height);
      ctx.restore();
    }
    // Rahmen
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(reg.x, reg.y, reg.width, reg.height);
    // Griffe (Ecken)
    ctx.setLineDash([]);
    ctx.fillStyle = '#22d3ee';
    const s = 6;
    ctx.fillRect(reg.x - s, reg.y - s, s * 2, s * 2);
    ctx.fillRect(reg.x + reg.width - s, reg.y - s, s * 2, s * 2);
    ctx.fillRect(reg.x - s, reg.y + reg.height - s, s * 2, s * 2);
    ctx.fillRect(reg.x + reg.width - s, reg.y + reg.height - s, s * 2, s * 2);
  };

  /** Maus-Events für Rechteckauswahl (einfaches Draw: click & drag) */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(displaySize.w, e.clientX - rect.left));
    const y = Math.max(0, Math.min(displaySize.h, e.clientY - rect.top));
    setStartPt({ x, y });
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startPt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(displaySize.w, e.clientX - rect.left));
    const y = Math.max(0, Math.min(displaySize.h, e.clientY - rect.top));
    const nx = Math.min(startPt.x, x);
    const ny = Math.min(startPt.y, y);
    const nw = Math.abs(x - startPt.x);
    const nh = Math.abs(y - startPt.y);
    const reg = { ...region, x: nx, y: ny, width: nw, height: nh };
    setRegion(reg);
    drawOverlay(displaySize, reg, showMaskPreview);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  /** UI-Toggles */
  useEffect(() => {
    drawOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMaskPreview, region.invert]);

  /** Region -> natürliche Koordinaten (für Backend/UPM) */
  const regionToNatural = (reg: Region) => {
    const sx = naturalSize.w / displaySize.w || 1;
    const sy = naturalSize.h / displaySize.h || 1;
    return {
      x: Math.round(reg.x * sx),
      y: Math.round(reg.y * sy),
      width: Math.round(reg.width * sx),
      height: Math.round(reg.height * sy),
      invert: reg.invert
    };
  };

  /** UPM Ergebnis */
  const handleUnifiedGeneration = async (result: any, mode: UpmMode) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      setStep('Bereite Region-Pipeline vor …');
      setProgress(15);
      await sleep(300);

      const enhancedPrompt = enhancePrompt(result.prompt, result.settings);
      const negativePrompt = buildNegativePrompt(result.settings);

      setStep('Erzeuge/Übertrage Maske …');
      setProgress(45);
      await sleep(600);

      setStep('Wende Transformationen an …');
      setProgress(75);
      await sleep(900);

      setStep('Finalisiere Ergebnis …');
      setProgress(95);
      await sleep(400);

      setProgress(100);

      // Demo-URLs – echte URLs später aus Backend verwenden
      const maskBlobUrl = await renderMaskAsBlobUrl();
      const outUrl = `https://picsum.photos/seed/${Date.now()}/1024/1024`;

      onRegionProcessed?.({
        imageUrl: outUrl,
        maskUrl: maskBlobUrl || undefined,
        region: regionToNatural(region),
        description: `${mode}: ${enhancedPrompt}`,
        mode
      });
    } catch (e) {
      console.error('Region UPM error:', e);
    } finally {
      setIsProcessing(false);
      setStep('');
      setProgress(0);
    }
  };

  /** Hilfsfunktion: Region als Masken-PNG (Blob URL) rendern */
  const renderMaskAsBlobUrl = async (): Promise<string | null> => {
    try {
      const c = document.createElement('canvas');
      c.width = naturalSize.w;
      c.height = naturalSize.h;
      const ctx = c.getContext('2d');
      if (!ctx) return null;
      // Standard: schwarze Fläche (0), weiße Region (1) – invert unterstützt
      ctx.fillStyle = region.invert ? '#FFFFFF' : '#000000';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = region.invert ? '#000000' : '#FFFFFF';
      const nat = regionToNatural(region);
      ctx.fillRect(nat.x, nat.y, nat.width, nat.height);
      return await new Promise((resolve) => {
        c.toBlob((blob) => {
          if (!blob) return resolve(null);
          resolve(URL.createObjectURL(blob));
        }, 'image/png');
      });
    } catch {
      return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-[980px] max-w-[96vw] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MousePointerSquare className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Region Selection Tool</CardTitle>
                <p className="text-white/80 text-sm">
                  Ziehe mit der Maus ein Rechteck auf dem Bild. Verarbeitung erfolgt über die Unified Prompt Mask (UPM).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                {naturalSize.w}×{naturalSize.h}
              </Badge>
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
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="p-4">
          {!selectedImageUrl ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5" />
                <div>
                  <div className="font-medium">Kein Bild ausgewählt</div>
                  <div className="text-sm">
                    Bitte markiere zuerst ein Bild im Chat (draufklicken), dann öffne dieses Tool erneut.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Optionen */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={region.invert}
                    onCheckedChange={(v) => {
                      setRegion((r) => ({ ...r, invert: !!v }));
                      drawOverlay();
                    }}
                    id="invert"
                  />
                  <label htmlFor="invert" className="text-sm">Selektion invertieren</label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showMaskPreview}
                    onCheckedChange={(v) => {
                      setShowMaskPreview(!!v);
                      drawOverlay(displaySize, region, !!v);
                    }}
                    id="maskprev"
                  />
                  <label htmlFor="maskprev" className="text-sm">Maskenvorschau</label>
                  {showMaskPreview ? <Eye className="h-4 w-4 text-slate-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Crop className="h-4 w-4" />
                  <span>
                    Region: {region.width}×{region.height} @ ({region.x},{region.y})
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset auf zentrales 60%-Fenster
                      const w = Math.floor(displaySize.w * 0.6);
                      const h = Math.floor(displaySize.h * 0.6);
                      const x = Math.floor((displaySize.w - w) / 2);
                      const y = Math.floor((displaySize.h - h) / 2);
                      const reg = { x, y, width: w, height: h, invert: false };
                      setRegion(reg);
                      drawOverlay(displaySize, reg, showMaskPreview);
                    }}
                  >
                    Auswahl zentrieren
                  </Button>
                </div>
              </div>

              {/* Bild + Overlay */}
              <div
                ref={containerRef}
                className="relative w-full flex items-center justify-center"
                style={{ minHeight: Math.max(260, displaySize.h) }}
              >
                <img
                  ref={imgRef}
                  src={selectedImageUrl}
                  alt="Quelle"
                  width={displaySize.w}
                  height={displaySize.h}
                  className="rounded-md border border-slate-200 bg-white object-contain"
                  onLoad={() => setImgLoaded(true)}
                  draggable={false}
                />

                {/* Zeichen-Overlay */}
                <canvas
                  ref={canvasRef}
                  width={displaySize.w}
                  height={displaySize.h}
                  className="absolute top-0 left-0 cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setDrawing(false)}
                />
              </div>

              {/* Aktionen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <Button
                  className="h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                  onClick={() => {
                    setCurrentMode('image2image'); // wir nutzen image2image als Bearbeitung der gewählten Region
                    openPromptMask('image2image', {
                      format: 'image',
                      region: regionToNatural(region),
                      regionMode: region.invert ? 'outside' : 'inside',
                      sourceImage: selectedImageUrl
                    });
                  }}
                  disabled={isProcessing || region.width < 4 || region.height < 4}
                  title="Region über UPM bearbeiten (image2image)"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Region bearbeiten (UPM)
                </Button>

                <Button
                  className="h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  onClick={() => {
                    setCurrentMode('face_generation'); // Gesichtsoperationen mit der Region als Input
                    openPromptMask('face_generation', {
                      format: 'image',
                      action: 'save', // oder 'use' – je nach UPM-Maske
                      region: regionToNatural(region),
                      sourceImage: selectedImageUrl
                    });
                  }}
                  disabled={isProcessing || region.width < 4 || region.height < 4}
                  title="Gesicht in Region extrahieren/verarbeiten (UPM)"
                >
                  <ScanFace className="h-4 w-4 mr-2" />
                  Gesicht aus Region (UPM)
                </Button>
              </div>

              {/* Fortschritt */}
              {isProcessing && (
                <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                    <span className="text-sm font-medium">{step || 'Verarbeite …'}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="mt-2 text-xs text-slate-600">{progress}% Complete</div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ✨ UPM Modal */}
      <UnifiedPromptMask
        open={isPromptMaskOpen}
        onClose={closePromptMask}
        initialSettings={currentSettings || undefined}
        onSettingsChange={() => {}}
        onGenerate={handleGenerate}
        mode={currentMode}
        title={
          currentMode === 'face_generation'
            ? 'FACE_GENERATION – Region verwenden'
            : currentMode === 'image2image'
            ? 'IMAGE2IMAGE – Region bearbeiten'
            : 'REGION_PROCESSING'
        }
      />
    </div>
  );
}
