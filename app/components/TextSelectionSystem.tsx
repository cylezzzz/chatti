// app/components/TextSelectionSystem.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Quote } from 'lucide-react';

interface SelectionContext {
  selectedText: string;
  messageId: string;
  selectionRange: Range;
  position: { x: number; y: number };
  originalMessage: string;
}

interface TextSelectionSystemProps {
  children: React.ReactNode;
  messageId: string;
  onContextualChat: (context: SelectionContext, question: string) => void;
}

export default function TextSelectionSystem({ 
  children, 
  messageId, 
  onContextualChat 
}: TextSelectionSystemProps) {
  const [selection, setSelection] = useState<SelectionContext | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [question, setQuestion] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();
      
      if (selectedText.length === 0) {
        setSelection(null);
        setShowContextMenu(false);
        return;
      }

      // Prüfe ob Selektion innerhalb unseres Containers ist
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        return;
      }

      // Position der Selektion ermitteln
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      const context: SelectionContext = {
        selectedText,
        messageId,
        selectionRange: range.cloneRange(),
        position: {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.bottom - containerRect.top + 10
        },
        originalMessage: containerRef.current!.textContent || ''
      };

      setSelection(context);
      
      // Highlight der Selektion hinzufügen
      highlightSelection(range);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        clearSelection();
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageId]);

  const highlightSelection = (range: Range) => {
    // Entferne vorherige Highlights
    removeHighlights();

    // Erstelle Highlight-Span
    try {
      const span = document.createElement('span');
      span.className = 'text-selection-highlight bg-blue-200 dark:bg-blue-800 rounded px-1';
      span.setAttribute('data-selection-id', messageId);
      
      range.surroundContents(span);
    } catch (error) {
      // Falls surroundContents fehlschlägt (z.B. bei komplexeren Selektionen)
      console.log('Complex selection detected');
    }
  };

  const removeHighlights = () => {
    const highlights = document.querySelectorAll(`[data-selection-id="${messageId}"]`);
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
  };

  const clearSelection = () => {
    removeHighlights();
    setSelection(null);
    setShowContextMenu(false);
    setQuestion('');
    window.getSelection()?.removeAllRanges();
  };

  const handleAskQuestion = () => {
    if (!selection) return;
    setShowContextMenu(true);
  };

  const handleSubmitQuestion = () => {
    if (!selection || !question.trim()) return;
    
    onContextualChat(selection, question);
    clearSelection();
  };

  return (
    <div ref={containerRef} className="relative select-text">
      {children}
      
      {/* Selection Popup */}
      {selection && !showContextMenu && (
        <div 
          className="absolute z-50 transform -translate-x-1/2"
          style={{
            left: selection.position.x,
            top: selection.position.y
          }}
        >
          <Card className="p-2 shadow-lg border-blue-500/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAskQuestion}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Darüber sprechen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Question Input Modal */}
      {showContextMenu && selection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Quote className="h-4 w-4 text-blue-500" />
              Ausgewählter Text:
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm italic">"{selection.selectedText}"</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Was möchtest du über den markierten Text wissen?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="z.B. 'Erkläre das genauer' oder 'Was bedeutet das?'"
                className="w-full p-3 border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowContextMenu(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmitQuestion}
                disabled={!question.trim()}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Frage stellen
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Integration in ChatInterface.tsx:
export function useChatWithContext() {
  const handleContextualChat = async (context: SelectionContext, question: string) => {
    // Erstelle kontextuellen Prompt
    const contextualPrompt = `
Bezogen auf den folgenden markierten Text aus der vorherigen Nachricht:

"${context.selectedText}"

Ursprüngliche Nachricht: "${context.originalMessage}"

Nutzer-Frage: ${question}

Bitte beantworte die Frage spezifisch bezogen auf den markierten Text-Abschnitt.
    `.trim();

    // TODO: An KI-Backend senden
    console.log('🎯 Kontextuelle Frage:', {
      selection: context.selectedText,
      question,
      messageId: context.messageId
    });

    // Hier würde der normale Chat-Flow weitergehen
    // sendToBackend({ text: contextualPrompt, files: [], selectedMedia: [] });
  };

  return { handleContextualChat };
}