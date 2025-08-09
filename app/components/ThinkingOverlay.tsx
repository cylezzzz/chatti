'use client';

export default function ThinkingOverlay({ open, text }: { open: boolean; text?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <div className="rounded-lg border bg-background p-4 shadow-xl min-w-[320px] max-w-[90vw]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-sm">Denke nach…</div>
        </div>
        {text ? <p className="mt-2 text-xs text-muted-foreground">{text}</p> : null}
      </div>
    </div>
  );
}
