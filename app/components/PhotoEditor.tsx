'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wand2, 
  Palette, 
  Sun, 
  Zap,
  Sparkles,
  Download,
  X,
  RefreshCw,
  Save,
  Undo,
  Redo,
  Camera,
  Filter,
  Eye,
  Contrast,
  Droplet,
  Magic,
  Eraser,
  Target,
  Layers,
  Settings
} from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  onComplete: (editedImageUrl: string, editDescription: string) => void;
  onClose: () => void;
}

// Quick Action Buttons oberhalb der Text-Eingabe
const QUICK_ACTIONS = [
  { 
    id: 'brighten', 
    icon: Sun, 
    label: 'Heller', 
    prompt: 'Mache das Bild heller und natürlicher',
    color: 'bg-yellow-500 hover:bg-yellow-400',
    description: 'Automatische Aufhellung'
  },
  { 
    id: 'enhance_face', 
    icon: Eye, 
    label: 'Gesicht', 
    prompt: 'Verbessere das Gesicht: Hautglättung, Augen betonen, natürlicher Look',
    color: 'bg-pink-500 hover:bg-pink-400',
    description: 'Gesichtsoptimierung'
  },
  { 
    id: 'remove_object', 
    icon: Eraser, 
    label: 'Entfernen', 
    prompt: 'Entferne störende Objekte aus dem Bild',
    color: 'bg-red-500 hover:bg-red-400',
    description: 'Objekte löschen'
  },
  { 
    id: 'change_background', 
    icon: Layers, 
    label: 'Hintergrund', 
    prompt: 'Ändere den Hintergrund',
    color: 'bg-blue-500 hover:bg-blue-400',
    description: 'Neuer Hintergrund'
  },
  { 
    id: 'enhance_colors', 
    icon: Palette, 
    label: 'Farben', 
    prompt: 'Verbessere die Farben für lebendigen, natürlichen Look',
    color: 'bg-purple-500 hover:bg-purple-400',
    description: 'Farboptimierung'
  },
  { 
    id: 'sharpen', 
    icon: Target, 
    label: 'Schärfen', 
    prompt: 'Schärfe das Bild für mehr Details',
    color: 'bg-green-500 hover:bg-green-400',
    description: 'Bildschärfe'
  },
  { 
    id: 'vintage', 
    icon: Filter, 
    label: 'Vintage', 
    prompt: 'Erstelle vintage Retro-Look mit warmen, verblassten Farben',
    color: 'bg-orange-500 hover:bg-orange-400',
    description: 'Retro-Stil'
  },
  { 
    id: 'professional', 
    icon: Sparkles, 
    label: 'Profi', 
    prompt: 'Verwandle in professionelles Studio-Portrait mit optimaler Beleuchtung',
    color: 'bg-indigo-500 hover:bg-indigo-400',
    description: 'Studio-Qualität'
  }
];

const STYLE_FILTERS = [
  { name: 'Natürlich', prompt: 'Optimiere natürlich ohne Übertreibung', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Dramatisch', prompt: 'Erstelle dramatischen Look mit starken Kontrasten', gradient: 'from-red-500 to-orange-500' },
  { name: 'Weich', prompt: 'Sanfter, weicher Look mit gedämpften Farben', gradient: 'from-pink-300 to-rose-400' },
  { name: 'Lebendig', prompt: 'Kräftige, lebendige Farben und hoher Kontrast', gradient: 'from-cyan-400 to-blue-500' },
  { name: 'Monochrom', prompt: 'Künstlerisches Schwarz-Weiß mit perfekten Graustufen', gradient: 'from-gray-400 to-gray-600' },
  { name: 'Warm', prompt: 'Warme Farbtöne für gemütliche Atmosphäre', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Cool', prompt: 'Kühle Farbtöne für modernen Look', gradient: 'from-blue-400 to-purple-500' },
  { name: 'HDR', prompt: 'HDR-Effekt mit starken Details und Farben', gradient: 'from-purple-500 to-pink-500' }
];

export default function PhotoEditor({ imageUrl, onComplete, onClose }: PhotoEditorProps) {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([imageUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const applyQuickAction = async (action: typeof QUICK_ACTIONS[0]) => {
    setSelectedAction(action.id);
    setProcessing(action.id);
    setCurrentPrompt(action.prompt);
    
    // Simuliere KI-Bearbeitung
    setTimeout(() => {
      const newImageUrl = `${imageUrl}?action=${action.id}&t=${Date.now()}`;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setProcessing(null);
    }, 2000);
  };

  const applyStyleFilter = async (filter: typeof STYLE_FILTERS[0]) => {
    setProcessing('style');
    setCurrentPrompt(filter.prompt);
    
    setTimeout(() => {
      const newImageUrl = `${imageUrl}?style=${encodeURIComponent(filter.name)}&t=${Date.now()}`;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setProcessing(null);
    }, 2000);
  };

  const processCustomPrompt = async () => {
    if (!currentPrompt.trim()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const newImageUrl = `${imageUrl}?custom=${encodeURIComponent(currentPrompt)}&t=${Date.now()}`;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setIsProcessing(false);
      setCurrentPrompt('');
    }, 3000);
  };

  const getCurrentImageUrl = () => history[historyIndex];

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleComplete = () => {
    const currentImage = getCurrentImageUrl();
    const description = 'Bildbearbeitung abgeschlossen';
    onComplete(currentImage, description);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header mit Logo */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-cyan-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Magic className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Writeora Studio
                </h1>
                <p className="text-xs text-cyan-300">KI Photo Editor</p>
              </div>
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2">
              {processing && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Bearbeitung läuft...
                </Badge>
              )}
              {!processing && history.length > 1 && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  ✓ {history.length - 1} Änderung{history.length > 2 ? 'en' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} className="border-slate-600">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="border-slate-600">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => {
              const link = document.createElement('a');
              link.href = getCurrentImageUrl();
              link.download = `writeora-edit-${Date.now()}.jpg`;
              link.click();
            }} className="border-slate-600">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={handleComplete} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500">
              <Save className="h-4 w-4 mr-2" />
              Fertig
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-600">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hauptbereich mit Bild */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-800/20">
        <div className="relative">
          <img
            src={getCurrentImageUrl()}
            alt="Zu bearbeitendes Bild"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700/50"
            style={{ maxHeight: '60vh', maxWidth: '70vw' }}
          />
          {(isProcessing || processing) && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 flex items-center gap-3 border border-slate-700">
                <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                <span className="text-white">KI bearbeitet das Bild...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Input */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Quick Action Buttons */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Quick Actions</span>
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                Ein Klick
              </Badge>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className={`h-16 flex flex-col gap-1 border-slate-600 hover:border-slate-500 ${
                    selectedAction === action.id ? 'bg-slate-700 border-cyan-500' : ''
                  } ${processing === action.id ? 'opacity-50' : ''}`}
                  onClick={() => applyQuickAction(action)}
                  disabled={!!processing}
                  title={action.description}
                >
                  <div className={`p-1.5 rounded-md ${action.color}`}>
                    <action.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-white">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Style Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Style Filters</span>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              {STYLE_FILTERS.map((filter) => (
                <Button
                  key={filter.name}
                  variant="outline"
                  size="sm"
                  className="h-12 border-slate-600 hover:border-slate-500 p-0 overflow-hidden"
                  onClick={() => applyStyleFilter(filter)}
                  disabled={!!processing}
                >
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${filter.gradient} opacity-80 hover:opacity-100 transition-opacity`}>
                    <span className="text-xs font-medium text-white">{filter.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium text-white">Eigene Beschreibung</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="Beschreibe detailliert was du ändern möchtest... (z.B. 'entferne die Person links im blauen Shirt')"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && processCustomPrompt()}
                  disabled={isProcessing || !!processing}
                />
              </div>
              <Button
                onClick={processCustomPrompt}
                disabled={!currentPrompt.trim() || isProcessing || !!processing}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-6 h-12"
              >
                <Magic className="h-4 w-4 mr-2" />
                Anwenden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}