'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Pencil, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2, 
  Check, 
  X, 
  Palette,
  Download,
  Wand2
} from 'lucide-react';

interface SketchOverlayProps {
  imageUrl: string;
  onSketchComplete: (sketchData: string, prompt: string) => void;
  onClose: () => void;
}

const BRUSH_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ffffff', '#000000', '#ff8800', '#8800ff', '#88ff00', '#ff0088'
];

const BRUSH_SIZES = [2, 4, 8, 12, 16, 24];

export default function SketchOverlay({ imageUrl, onSketchComplete, onClose }: SketchOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(8);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleImageLoad = () => {
      // Canvas an Bildgröße anpassen
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Bild als Hintergrund zeichnen
      ctx.drawImage(image, 0, 0);
      
      // Erste Version in History speichern
      const initialState = canvas.toDataURL();
      setHistory([initialState]);
      setHistoryIndex(0);
      setImageLoaded(true);
    };

    if (image.complete) {
      handleImageLoad();
    } else {
      image.addEventListener('load', handleImageLoad);
      return () => image.removeEventListener('load', handleImageLoad);
    }
  }, [imageUrl]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newState = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    saveToHistory();
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas || !prompt.trim()) return;

    const sketchData = canvas.toDataURL();
    onSketchComplete(sketchData, prompt);
  };

  const downloadSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `sketch-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="animate-pulse text-white">Lade Bild...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Sketch Editor
            </h2>
            <Badge className="bg-blue-600">
              Zeichne Objekte die hinzugefügt werden sollen
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadSketch}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Tools */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={tool === 'brush' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('brush')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Größe:</span>
              <div className="flex items-center gap-1">
                {BRUSH_SIZES.map(size => (
                  <Button
                    key={size}
                    variant={brushSize === size ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setBrushSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {tool === 'brush' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Farbe:</span>
                <div className="flex items-center gap-1">
                  {BRUSH_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        brushColor === color ? 'border-white' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBrushColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="relative max-w-full max-h-full">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Base image"
            className="absolute inset-0 w-full h-full object-contain opacity-0"
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className="border border-slate-600 rounded-lg shadow-lg cursor-crosshair max-w-full max-h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>

      {/* Prompt Input */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-300 mb-2 block">
                Beschreibe was die gezeichneten Bereiche werden sollen:
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="z.B. 'Füge einen roten Ball hinzu' oder 'Zeichne eine Katze an dieser Stelle'"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <Button
              onClick={handleComplete}
              disabled={!prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 px-6"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}