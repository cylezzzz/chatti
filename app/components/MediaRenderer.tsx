"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Download, 
  Share, 
  Edit, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  MoreHorizontal,
  Sparkles,
  Wand2,
  Copy,
  Pencil,
  Camera,
  Palette,
  Zap,
  Filter,
  FileText,
  CheckCircle
} from "lucide-react";
import PhotoEditor from "./PhotoEditor";
import SketchOverlay from "./SketchOverlay";

type Media =
  | { type: "image"; url: string; alt?: string }
  | { type: "video"; url: string; poster?: string }
  | { type: "file"; url: string; name?: string; size?: number };

interface MediaRendererProps {
  items: Media[];
  onMediaSelect?: (url: string, isSelected: boolean) => void;
  selectedMedia?: string[];
  showSelectionUI?: boolean;
  onMediaEdit?: (originalUrl: string, editedUrl: string, description: string) => void;
}

function basename(u: string) {
  try {
    const p = new URL(u);
    return (p.pathname.split('/').pop() || u) as string;
  } catch {
    const parts = u.split('/');
    return parts[parts.length - 1] || u;
  }
}

export default function MediaRenderer({ 
  items, 
  onMediaSelect, 
  selectedMedia = [], 
  showSelectionUI = false,
  onMediaEdit
}: MediaRendererProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showPhotoEditor, setShowPhotoEditor] = useState<string | null>(null);
  const [showSketchEditor, setShowSketchEditor] = useState<string | null>(null);

  if (!items?.length) return null;

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Content',
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const handlePhotoEditComplete = (originalUrl: string, editedUrl: string, description: string) => {
    setShowPhotoEditor(null);
    if (onMediaEdit) {
      onMediaEdit(originalUrl, editedUrl, description);
    }
  };

  const handleSketchComplete = (sketchData: string, prompt: string) => {
    setShowSketchEditor(null);
    if (onMediaEdit) {
      onMediaEdit(showSketchEditor!, sketchData, `Sketch: ${prompt}`);
    }
  };

  return (
    <>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => {
          const id = `${index}-${item.type}`;
          const isSelected = selectedMedia.includes(item.url);
          const isHovered = hoveredItem === id;

          if (item.type === "image") {
            return (
              <Card 
                key={id} 
                className="group relative overflow-hidden border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Selection Overlay */}
                {showSelectionUI && onMediaSelect && (
                  <div 
                    className={`absolute top-3 right-3 z-20 w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'bg-white/20 border-white/60 hover:bg-white/30'
                    }`}
                    onClick={() => onMediaSelect(item.url, !isSelected)}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Image */}
                <img
                  src={item.url}
                  alt={item.alt || 'Generated image'}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />

                {/* Hover Actions */}
                {(isHovered || isSelected) && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={() => handleDownload(item.url, basename(item.url))}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setShowPhotoEditor(item.url)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={() => handleShare(item.url)}
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          }

          if (item.type === "video") {
            return (
              <Card 
                key={id} 
                className="group relative overflow-hidden border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Selection Overlay */}
                {showSelectionUI && onMediaSelect && (
                  <div 
                    className={`absolute top-3 right-3 z-20 w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'bg-white/20 border-white/60 hover:bg-white/30'
                    }`}
                    onClick={() => onMediaSelect(item.url, !isSelected)}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Video */}
                <video
                  src={item.url}
                  poster={item.poster}
                  controls
                  className="w-full h-auto max-h-96 rounded-lg"
                />

                {/* Hover Actions */}
                {(isHovered || isSelected) && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={() => handleDownload(item.url, basename(item.url))}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={() => handleShare(item.url)}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                )}
              </Card>
            );
          }

          if (item.type === "file") {
            return (
              <Card 
                key={id} 
                className="group p-4 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-white">{item.name || basename(item.url)}</p>
                      {item.size && (
                        <p className="text-sm text-slate-400">
                          {(item.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(item.url, item.name || basename(item.url))}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(item.url)}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            );
          }

          return null;
        })}
      </div>

      {/* Photo Editor Modal */}
      {showPhotoEditor && (
        <PhotoEditor
          imageUrl={showPhotoEditor}
          onComplete={handlePhotoEditComplete}
          onClose={() => setShowPhotoEditor(null)}
        />
      )}

      {/* Sketch Editor Modal */}
      {showSketchEditor && (
        <SketchOverlay
          imageUrl={showSketchEditor}
          onSketchComplete={handleSketchComplete}
          onClose={() => setShowSketchEditor(null)}
        />
      )}
    </>
  );
}