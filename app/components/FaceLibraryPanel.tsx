'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  User,
  Star,
  Grid3X3,
  List,
  Search,
  Plus,
  Trash2,
  Copy,
  X,
  Upload,
  Camera,
  Wand2,
  Loader2
} from 'lucide-react';

// ✨ UPM
import UnifiedPromptMask from './UnifiedPromptMask';
import { useUnifiedPrompt, enhancePrompt, buildNegativePrompt } from './useUnifiedPrompt';

interface FaceLibraryPanelProps {
  open: boolean;
  onClose: () => void;
  onFaceSaved?: (face: SavedFace) => void;
  onFaceUsed?: (faceId: string) => void;
  /** Optional: bereits im Chat ausgewähltes Bild (Quelle für „Gesicht hinzufügen“) */
  selectedImageUrl?: string;
}

interface SavedFace {
  id: string;
  name: string;
  imageUrl: string;         // vorzugsweise gecropptes Face (hier Demo)
  originalImageUrl: string; // Originalbild
  boundingBox?: BoundingBox; // optional – echte Pipeline liefert das zurück
  embedding?: number[];       // optional – echte Pipeline liefert das zurück
  tags: string[];
  createdAt: number;
  lastUsed?: number;
  timesUsed: number;
  category: 'person' | 'character' | 'celebrity' | 'custom';
  isFavorite: boolean;
}

interface BoundingBox {
  x: number; y: number; width: number; height: number;
}

// Demo-Daten
const MOCK_FACES: SavedFace[] = [
  {
    id: '1',
    name: 'Anna Schmidt',
    imageUrl: 'https://picsum.photos/200/200?random=1',
    originalImageUrl: 'https://picsum.photos/800/600?random=1',
    tags: ['blonde', 'lächelnd', 'frontal'],
    createdAt: Date.now() - 86400000,
    lastUsed: Date.now() - 3600000,
    timesUsed: 5,
    category: 'person',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Max Weber',
    imageUrl: 'https://picsum.photos/200/200?random=2',
    originalImageUrl: 'https://picsum.photos/800/600?random=2',
    tags: ['bart', 'brille', 'seitlich'],
    createdAt: Date.now() - 172800000,
    timesUsed: 3,
    category: 'person',
    isFavorite: false
  },
  {
    id: '3',
    name: 'Fantasy Character',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    originalImageUrl: 'https://picsum.photos/800/600?random=3',
    tags: ['fantasy', 'elfen-ohren', 'mystisch'],
    createdAt: Date.now() - 259200000,
    timesUsed: 8,
    category: 'character',
    isFavorite: true
  }
];

const FACE_CATEGORIES = [
  { id: 'all', name: 'Alle', icon: Users },
  { id: 'person', name: 'Personen', icon: User },
  { id: 'character', name: 'Charaktere', icon: User },
  { id: 'celebrity', name: 'Prominente', icon: Star },
  { id: 'custom', name: 'Eigene', icon: Camera }
];

type ViewMode = 'grid' | 'list';
type FaceMode = 'face_generation'; // wir bündeln Face-Speichern/Verwenden über einen UPM-Mode
type UpmAction = 'save' | 'use';

export default function FaceLibraryPanel({
  open,
  onClose,
  onFaceSaved,
  onFaceUsed,
  selectedImageUrl
}: FaceLibraryPanelProps) {
  // Tabs / Filter
  const [activeTab, setActiveTab] = useState<'library' | 'add'>('library');
  const [faces, setFaces] = useState<SavedFace[]>(MOCK_FACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Add-Quelle (nur ein simples Upload + optional ausgewähltes Chat-Bild)
  const [newFaceImage, setNewFaceImage] = useState<string>(selectedImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing / Progress (UPM)
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>('');

  // UPM
  const {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate
  } = useUnifiedPrompt((result, mode) => {
    handleUnifiedGeneration(result, mode as FaceMode);
  });
  const [currentMode] = useState<FaceMode>('face_generation');
  const [currentAction, setCurrentAction] = useState<UpmAction>('save');
  const [currentFaceId, setCurrentFaceId] = useState<string | null>(null);
  const [currentSourceImage, setCurrentSourceImage] = useState<string | null>(null);

  // Utils
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Filter + Sort
  const filteredFaces = faces.filter((face) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      face.name.toLowerCase().includes(q) ||
      face.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'all' || face.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedFaces = [...filteredFaces].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'recent': return b.createdAt - a.createdAt;
      case 'popular': return b.timesUsed - a.timesUsed;
      case 'favorites': return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      default: return 0;
    }
  });

  // UPM-Ergebnis verarbeiten (einheitlich: save oder use)
  const handleUnifiedGeneration = async (result: any, _mode: FaceMode) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      setStep('Analyse & Vorbereitung …');
      setProgress(15);
      await sleep(300);

      const enhancedPrompt = enhancePrompt(result.prompt, result.settings);
      const _negativePrompt = buildNegativePrompt(result.settings);

      setStep('Gesichtspipeline läuft …');
      setProgress(55);
      await sleep(900);

      setStep('Finalisiere …');
      setProgress(85);
      await sleep(600);

      setProgress(100);

      if (currentAction === 'save') {
        // Demo: wir erzeugen einen neuen Face-Eintrag aus Quelle + Settings
        const newFace: SavedFace = {
          id: Date.now().toString(),
          name:
            result?.settings?.faceName ||
            result?.settings?.name ||
            'Unbenanntes Gesicht',
          imageUrl: (currentSourceImage || selectedImageUrl || newFaceImage) ||
            `https://picsum.photos/200/200?face=t${Date.now()}`, // Demo
          originalImageUrl: (currentSourceImage || selectedImageUrl || newFaceImage) ||
            `https://picsum.photos/800/600?src=t${Date.now()}`,
          tags: Array.isArray(result?.settings?.tags)
            ? result.settings.tags
            : (typeof result?.settings?.tags === 'string'
              ? result.settings.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
              : []),
          createdAt: Date.now(),
          timesUsed: 0,
          category: (result?.settings?.category || 'person') as SavedFace['category'],
          isFavorite: !!result?.settings?.favorite
        };

        setFaces((prev) => [...prev, newFace]);
        onFaceSaved?.(newFace);

        // Reset Add-Quelle
        setNewFaceImage('');
        setCurrentSourceImage(null);
        setActiveTab('library');
      } else {
        // use: markiere Stats und triggere Callback
        if (currentFaceId) {
          setFaces((prev) =>
            prev.map((f) =>
              f.id === currentFaceId
                ? { ...f, timesUsed: f.timesUsed + 1, lastUsed: Date.now() }
                : f
            )
          );
          onFaceUsed?.(currentFaceId);
        }
      }
    } catch (err) {
      console.error('UPM Face Generation Error:', err);
    } finally {
      setIsProcessing(false);
      setStep('');
      setProgress(0);
      setCurrentFaceId(null);
      setCurrentAction('save');
    }
  };

  // UI-Handler
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setNewFaceImage(url);
  };

  const toggleFavorite = (faceId: string) => {
    setFaces((prev) => prev.map((f) => (f.id === faceId ? { ...f, isFavorite: !f.isFavorite } : f)));
  };

  const deleteFace = (faceId: string) => {
    setFaces((prev) => prev.filter((f) => f.id !== faceId));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Gesichter-Bibliothek</CardTitle>
                <p className="text-white/80 text-sm">
                  Speichere & verwende Gesichter – jetzt über die Unified Prompt Mask (UPM)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                {faces.length} Gesichter
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Bibliothek ({faces.length})
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Gesicht hinzufügen
              </TabsTrigger>
            </TabsList>

            {/* Bibliothek */}
            <TabsContent value="library" className="p-4 space-y-4">
              {/* Filter */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Suche nach Namen oder Tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FACE_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <c.icon className="h-4 w-4" />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Neueste</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="popular">Beliebteste</SelectItem>
                    <SelectItem value="favorites">Favoriten</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Faces */}
              <div className="max-h-96 overflow-y-auto">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-4 gap-4">
                    {sortedFaces.map((face) => (
                      <Card key={face.id} className="group hover:shadow-lg transition-all">
                        <CardContent className="p-3">
                          <div className="relative mb-3">
                            <img
                              src={face.imageUrl}
                              alt={face.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/50 text-white hover:bg-black/70"
                              onClick={() => toggleFavorite(face.id)}
                              title={face.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                            >
                              <Star className={`h-4 w-4 ${face.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                          </div>

                          <h4 className="font-medium text-sm mb-1 truncate">{face.name}</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {face.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {face.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{face.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 mb-3">
                            {face.timesUsed}x verwendet
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                              onClick={() => {
                                setCurrentAction('use');
                                setCurrentFaceId(face.id);
                                openPromptMask('face_generation', {
                                  format: 'image',
                                  faceId: face.id,
                                  faceName: face.name,
                                  action: 'use'
                                });
                              }}
                              title="Dieses Gesicht per UPM in einem Prompt verwenden"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Mit UPM verwenden
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteFace(face.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Löschen"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedFaces.map((face) => (
                      <Card key={face.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={face.imageUrl}
                            alt={face.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{face.name}</h4>
                              {face.isFavorite && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {face.category}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {face.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-slate-500">
                              {face.timesUsed}x verwendet •{' '}
                              {new Date(face.createdAt).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentAction('use');
                                setCurrentFaceId(face.id);
                                openPromptMask('face_generation', {
                                  format: 'image',
                                  faceId: face.id,
                                  faceName: face.name,
                                  action: 'use'
                                });
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Mit UPM verwenden
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => deleteFace(face.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {sortedFaces.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Gesichter gefunden</h3>
                    <p className="text-slate-600 mb-4">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Versuche andere Suchkriterien'
                        : 'Füge dein erstes Gesicht hinzu'}
                    </p>
                    <Button onClick={() => setActiveTab('add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gesicht hinzufügen
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Gesicht hinzufügen (mit UPM statt eigener Formularlogik) */}
            <TabsContent value="add" className="p-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Wähle ein Bild mit einem Gesicht. Die **Unified Prompt Mask (UPM)** übernimmt Erkennung, Zuschneiden,
                  Tags & Metadaten. Du kannst den Namen, Kategorie und weitere Optionen direkt in der Maske setzen.
                </p>
              </div>

              {/* Image Source */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bild</label>
                {!newFaceImage ? (
                  <div
                    onClick={handleUploadClick}
                    className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 bg-slate-50"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-slate-600">Bild hochladen oder hier klicken</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={newFaceImage}
                      alt="Ausgewähltes Bild"
                      className="w-full h-64 object-contain bg-slate-100 rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setNewFaceImage('')}
                      title="Bild entfernen"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  className="h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  onClick={() => {
                    if (!newFaceImage && !selectedImageUrl) return;
                    setCurrentAction('save');
                    setCurrentSourceImage(newFaceImage || selectedImageUrl || null);
                    openPromptMask('face_generation', {
                      format: 'image',
                      action: 'save',
                      sourceImage: newFaceImage || selectedImageUrl || undefined,
                      category: 'person',
                      tags: [],
                    });
                  }}
                  disabled={isProcessing || (!newFaceImage && !selectedImageUrl)}
                  title={newFaceImage || selectedImageUrl ? 'Gesicht extrahieren & speichern (UPM)' : 'Erst ein Bild wählen'}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Gesicht extrahieren & speichern (UPM)
                </Button>

                <Button
                  className="h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                  onClick={() => {
                    if (!newFaceImage && !selectedImageUrl) return;
                    setCurrentAction('save');
                    setCurrentSourceImage(newFaceImage || selectedImageUrl || null);
                    openPromptMask('face_generation', {
                      format: 'image',
                      action: 'save',
                      sourceImage: newFaceImage || selectedImageUrl || undefined,
                      favorite: true
                    });
                  }}
                  disabled={isProcessing || (!newFaceImage && !selectedImageUrl)}
                  title="Schnell speichern (als Favorit) – UPM"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Schnell speichern (UPM)
                </Button>
              </div>

              {isProcessing && (
                <div className="mt-2 rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span className="text-sm font-medium">{step || 'Verarbeite …'}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded">
                    <div
                      className="h-2 bg-emerald-600 rounded"
                      style={{ width: `${progress}%`, transition: 'width .2s ease' }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-600">{progress}% Complete</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
          currentAction === 'use'
            ? 'FACE_GENERATION - Gesicht verwenden'
            : 'FACE_GENERATION - Gesicht extrahieren & speichern'
        }
      />
    </div>
  );
}
