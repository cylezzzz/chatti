'use client';

import { useEffect } from 'react';

export default function PlaceholderModal({
  open,
  title = 'Feature in Arbeit',
  message = 'Dieser Bereich ist bereits verdrahtet – Logik folgt.',
  onClose,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-xl w-[520px] max-w-[92vw] p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="px-3 py-1.5 rounded border hover:bg-accent" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
