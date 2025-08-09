"use client";
import React, { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X, Image as ImageIcon, Video } from "lucide-react";

interface SelectedMediaInfo {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

export function ChatInputWithSelection({
  onSend,
  disabled,
  selectedMedia = [],
  onClearSelection
}: {
  onSend: (payload: { text: string; files: File[]; selectedMedia: string[] }) => void;
  disabled?: boolean;
  selectedMedia?: string[];
  onClearSelection?: () => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim() && files.length === 0 && selectedMedia.length === 0) return;
    onSend({ text, files, selectedMedia });
    setText("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
    if (onClearSelection) onClearSelection();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedMedia = (mediaUrl: string) => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaTypeFromUrl = (url: string): 'image' | 'video' => {
    // Einfache Heuristik basierend auf URL oder könnte durch Props erweitert werden
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(extension)) {
      return 'video';
    }
    return 'image'; // Standard fallback
  };

  return (
    <div className="border-t border-zinc-800 p-4">
      {/* Ausgewählte Medien-Vorschau */}
      {selectedMedia.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400">
              {selectedMedia.length} Medium{selectedMedia.length !== 1 ? 'en' : ''} ausgewählt
            </span>
            <button
              onClick={onClearSelection}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Alle entfernen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMedia.map((mediaUrl, index) => {
              const mediaType = getMediaTypeFromUrl(mediaUrl);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-sm"
                >
                  {mediaType === 'video' ? (
                    <Video className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-blue-300 truncate max-w-[120px]">
                    {mediaType === 'video' ? 'Video' : 'Bild'} {index + 1}
                  </span>
                  <button
                    onClick={() => removeSelectedMedia(mediaUrl)}
                    className="text-blue-400 hover:text-blue-300 ml-1"
                    title="Medium entfernen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Datei-Vorschau */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm"
            >
              <span>{getFileIcon(file.type)}</span>
              <span className="truncate max-w-[150px]">{file.name}</span>
              <span className="text-zinc-400 text-xs">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-zinc-400 hover:text-white ml-1"
                title="Datei entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input-Bereich */}
      <div className="flex items-end gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="p-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
          title="Datei anhängen"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-zinc-200" />
        </button>
        
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files ?? []);
            setFiles(prev => [...prev, ...newFiles]);
          }}
          accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx,.zip"
        />
        
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={Math.min(4, Math.max(1, text.split('\n').length))}
            placeholder="Nachricht schreiben... (Enter = Senden, Shift+Enter = Neue Zeile)"
            disabled={disabled}
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          
          {/* Hilfstext */}
          <div className="absolute -bottom-6 left-0 text-xs text-zinc-500">
            Enter zum Senden • Shift+Enter für neue Zeile
            {selectedMedia.length > 0 && ` • ${selectedMedia.length} Medium${selectedMedia.length !== 1 ? 'en' : ''} ausgewählt`}
          </div>
        </div>
        
        <button
          onClick={submit}
          disabled={disabled || (!text.trim() && files.length === 0 && selectedMedia.length === 0)}
          className="px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nachricht senden"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}