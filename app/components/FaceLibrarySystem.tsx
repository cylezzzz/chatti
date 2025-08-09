// app/components/FaceLibrarySystem.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Save, 
  Search, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Crop,
  X,
  CheckCircle
} from 'lucide-react';

interface FaceData {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  boundingBox: BoundingBox;
  embedding?: number[];
  tags: string[];
  createdAt: number;
  usedCount: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function FaceLibrarySystem() {
  const [faces, setFaces] = useState<FaceData[]>([]);
  const [selectedFace, setSelectedFace] = useState<FaceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCropTool, setShowCropTool] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
  const [faceName, setFaceName] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFaceLibrary();
  }, []);

  const loadFaceLibrary = async () => {
    try {
      // TODO: Echte API-Integration
      const response = await fetch('/api/faces');
      if (response.ok) {
        const data = await response.json();
        setFaces(data.faces || []);
      }
    } catch (error) {
      console.log('📚 Face Library wird geladen...');
      // Demo-Daten für UI-Demo
      setFaces([
        {
          id: '1',
          name: 'Person 1',
          imageUrl: 'https://picsum.photos/200/200?random=1',
          thumbnailUrl: 'https://picsum.photos/100/100?random=1',
          boundingBox: { x: 50, y: 50, width: 100, height: 100 },
          tags: ['männlich', 'braune-haare'],
          createdAt: Date.now() - 86400000,
          usedCount: 5
        }
      ]);
    }
  };

  const detectFacesInImage = async (imageUrl: string): Promise<BoundingBox[]> => {
    setIsDetecting(true);
    
    try {
      // TODO: Echte Face-Detection API
      console.log('👤 Face Detection wird implementiert für:', imageUrl);
      
      // Simuliere Face-Detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock-Result
      return [
        { x: 100, y: 50, width: 150, height: 180 },
        { x: 300, y: 80, width: 140, height: 170 }
      ];
    } catch (error) {
      console.error('Face Detection Fehler:', error);
      return [];
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCurrentImage(imageUrl);
      setShowCropTool(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropSelection({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropSelection || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropSelection({
      ...cropSelection,
      endX: x,
      endY: y
    });
    
    drawCropOverlay();
  };

  const handleCanvasMouseUp = () => {
    if (cropSelection) {
      // Crop-Auswahl abgeschlossen
      console.log('Crop-Bereich ausgewählt:', cropSelection);
    }
  };

  const drawCropOverlay = () => {
    if (!canvasRef.current || !cropSelection) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Canvas leeren und Bild neu zeichnen
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Crop-Rechteck zeichnen
    const width = cropSelection.endX - cropSelection.startX;
    const height = cropSelection.endY - cropSelection.startY;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropSelection.startX, cropSelection.startY, width, height);
    
    // Semi-transparente Overlay außerhalb der Auswahl
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvasRef.current.width, cropSelection.startY); // Top
    ctx.fillRect(0, cropSelection.startY, cropSelection.startX, height); // Left
    ctx.fillRect(cropSelection.endX, cropSelection.startY, canvasRef.current.width - cropSelection.endX, height); // Right
    ctx.fillRect(0, cropSelection.endY, canvasRef.current.width, canvasRef.current.height - cropSelection.endY); // Bottom
  };

  const saveFaceFromCrop = async () => {
    if (!cropSelection || !currentImage || !faceName.trim()) return;
    
    try {
      // TODO: Crop-Bereich extrahieren und Face-Embedding generieren
      console.log('💾 Gesicht wird gespeichert:', {
        name: faceName,
        cropArea: cropSelection,
        imageUrl: currentImage
      });
      
      // Simuliere Face-Speicherung
      const newFace: FaceData = {
        id: Date.now().toString(),
        name: faceName,
        imageUrl: currentImage,
        thumbnailUrl: currentImage, // TODO: Thumbnail generieren
        boundingBox: {
          x: Math.min(cropSelection.startX, cropSelection.endX),
          y: Math.min(cropSelection.startY, cropSelection.endY),
          width: Math.abs(cropSelection.endX - cropSelection.startX),
          height: Math.abs(cropSelection.endY - cropSelection.startY)
        },
        tags: [],
        createdAt: Date.now(),
        usedCount: 0
      };
      
      setFaces(prev => [newFace, ...prev]);
      closeCropTool();
      
      // TODO: API-Call zum Speichern
      await fetch('/api/faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFace)
      });
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const deleteFace = async (faceId: string) => {
    try {
      setFaces(prev => prev.filter(face => face.id !== faceId));
      
      // TODO: API-Call zum Löschen
      await fetch(`/api/faces/${faceId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const closeCropTool = () => {
    setShowCropTool(false);
    setCurrentImage(null);
    setCropSelection(null);
    setFaceName('');
  };

  const filteredFaces = faces.filter(face => 
    face.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    face.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gesichter-Bibliothek
            <Badge variant="secondary">{faces.length} Gesichter</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload & Search */}
          <div className="flex gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Gesicht hinzufügen
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Namen oder Tags durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Face Grid */}
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-96">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFaces.map((face) => (
                <div
                  key={face.id}
                  className="group relative cursor-pointer"
                  onClick={() => setSelectedFace(selectedFace?.id === face.id ? null : face)}
                >
                  <div className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedFace?.id === face.id 
                      ? 'border-blue-500 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <img
                      src={face.thumbnailUrl}
                      alt={face.name}
                      className="w-full h-24 object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Actions */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFace(face.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedFace?.id === face.id && (
                      <div className="absolute top-1 left-1">
                        <CheckCircle className="h-5 w-5 text-blue-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  {/* Face Info */}
                  <div className="mt-1 text-center">
                    <p className="text-xs font-medium truncate">{face.name}</p>
                    <p className="text-xs text-gray-500">Verwendet: {face.usedCount}×</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Crop Tool Modal */}
      {showCropTool && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gesicht markieren und speichern</h3>
              <Button variant="ghost" onClick={closeCropTool}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Canvas für Crop-Tool */}
              <div className="relative border rounded-lg overflow-hidden bg-gray-100">
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt="Zu bearbeitendes Bild"
                  className="max-w-full max-h-96 object-contain hidden"
                  onLoad={() => {
                    if (canvasRef.current && imageRef.current) {
                      const canvas = canvasRef.current;
                      const img = imageRef.current;
                      
                      canvas.width = img.naturalWidth;
                      canvas.height = img.naturalHeight;
                      
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(img, 0, 0);
                      }
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-96 cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                />
              </div>
              
              {/* Face Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Name für das Gesicht:</label>
                <Input
                  value={faceName}
                  onChange={(e) => setFaceName(e.target.value)}
                  placeholder="z.B. 'Emma', 'Protagonist', 'Model 1'"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeCropTool}>
                  Abbrechen
                </Button>
                <Button
                  onClick={saveFaceFromCrop}
                  disabled={!cropSelection || !faceName.trim()}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Gesicht speichern
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Integration Helper
export function useFaceLibrary() {
  const applyFaceToGeneration = async (faceId: string, prompt: string): Promise<string> => {
    // TODO: Face-Embedding in Bild-Generierung einbinden
    console.log('🎭 Gesicht wird in Generierung angewendet:', { faceId, prompt });
    
    const enhancedPrompt = `${prompt}, using face reference ID: ${faceId}`;
    return enhancedPrompt;
  };

  const getFaceEmbedding = async (faceId: string): Promise<number[] | null> => {
    // TODO: Face-Embedding aus Datenbank laden
    console.log('🔍 Face-Embedding wird geladen für:', faceId);
    return null;
  };

  return { applyFaceToGeneration, getFaceEmbedding };
}