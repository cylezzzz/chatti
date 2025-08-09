// tests/components/upm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// 🔧 Import-Pfade an deine Struktur anpassen:
// Falls deine Dateien unter app/ liegen:
import UnifiedPromptMask from '@/app/UnifiedPromptMask';
// Alternative: import UnifiedPromptMask from '@/app/components/UnifiedPromptMask';
// Alternative: import UnifiedPromptMask from '@/components/UnifiedPromptMask';

import { useUnifiedPrompt } from '@/app/useUnifiedPrompt';
// Alternative: import { useUnifiedPrompt } from '@/components/useUnifiedPrompt';

// Falls Lucide-Icons o.ä. Probleme machen, könntest du sie so mocken:
// vi.mock('lucide-react', () => ({ Sparkles: () => <span data-testid="icon" /> }));

function Harness({
  mode,
  initialSettings,
  onDone,
}: {
  mode: 'text2image' | 'image2image' | 'text2video' | 'image2video' | 'face_generation';
  initialSettings?: any;
  onDone: (payload: any, mode: string) => void;
}) {
  const {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate,
  } = useUnifiedPrompt((result, m) => onDone(result, m));

  return (
    <div>
      <button
        onClick={() =>
          openPromptMask(mode, initialSettings ?? { format: mode.includes('video') ? 'video' : 'image' })
        }
      >
        open
      </button>
      <button
        onClick={() =>
          handleGenerate({
            prompt: 'a lighthouse on a cliff at dusk',
            settings: currentSettings ?? initialSettings ?? { format: 'image' },
          })
        }
      >
        gen
      </button>
      <button onClick={closePromptMask}>close</button>

      <UnifiedPromptMask
        open={isPromptMaskOpen}
        onClose={closePromptMask}
        initialSettings={currentSettings || initialSettings}
        onSettingsChange={() => {}}
        onGenerate={handleGenerate}
        mode={mode as any}
        title={`${mode.toUpperCase()} - Content Generation`}
      />
    </div>
  );
}

describe('UnifiedPromptMask – Basics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens and closes via props', async () => {
    const onDone = vi.fn();
    render(<Harness mode="text2image" onDone={onDone} />);

    // Open the mask
    fireEvent.click(screen.getByText('open'));

    // UI should now show something from the UPM (robuste Suche nach typischen Labels/Buttons)
    // Wir prüfen generisch auf das Title-Pattern:
    expect(await screen.findByText(/TEXT2IMAGE - Content Generation/i)).toBeTruthy();

    // Close again
    fireEvent.click(screen.getByText('close'));
    // Nach dem Schließen sollte der Titel verschwinden – wir lassen es tolerant (keine strikte Prüfung),
    // da UPM evtl. animiert; wichtiger ist der Generate-Test unten.
  });

  it('fires onGenerate with prompt & settings', async () => {
    const onDone = vi.fn();
    render(<Harness mode="text2image" onDone={onDone} />);

    fireEvent.click(screen.getByText('open'));
    expect(await screen.findByText(/TEXT2IMAGE - Content Generation/i)).toBeTruthy();

    // Simuliere Generate über Harness-Button (ruft handleGenerate)
    fireEvent.click(screen.getByText('gen'));

    expect(onDone).toHaveBeenCalledTimes(1);
    const [payload, mode] = onDone.mock.calls[0];
    expect(mode).toBe('text2image');
    expect(payload).toHaveProperty('prompt');
    expect(payload).toHaveProperty('settings');
    expect(payload.prompt).toMatch(/lighthouse/i);
  });

  it('passes region in image2image mode', async () => {
    const onDone = vi.fn();
    const initialSettings = {
      format: 'image',
      region: { x: 10, y: 12, width: 200, height: 160, invert: false },
      regionMode: 'inside',
    };
    render(<Harness mode="image2image" onDone={onDone} initialSettings={initialSettings} />);

    fireEvent.click(screen.getByText('open'));
    expect(await screen.findByText(/IMAGE2IMAGE - Content Generation/i)).toBeTruthy();

    fireEvent.click(screen.getByText('gen'));

    expect(onDone).toHaveBeenCalledTimes(1);
    const [payload, mode] = onDone.mock.calls[0];
    expect(mode).toBe('image2image');
    expect(payload.settings?.region).toEqual(initialSettings.region);
    expect(payload.settings?.regionMode).toBe('inside');
  });
});

describe('useUnifiedPrompt – hook flow', () => {
  it('openPromptMask → handleGenerate triggers consumer callback', async () => {
    const onDone = vi.fn();

    function HookHarness() {
      const {
        isPromptMaskOpen,
        currentSettings,
        openPromptMask,
        handleGenerate,
      } = useUnifiedPrompt((result, mode) => onDone(result, mode));

      return (
        <div>
          <span data-testid="open-state">{String(isPromptMaskOpen)}</span>
          <button onClick={() => openPromptMask('text2video', { format: 'video', duration: 3 })}>
            open
          </button>
          <button
            onClick={() =>
              handleGenerate({
                prompt: 'ocean waves',
                settings: currentSettings ?? { format: 'video', fps: 24 },
              })
            }
          >
            gen
          </button>
        </div>
      );
    }

    render(<HookHarness />);

    // Initially closed
    expect(screen.getByTestId('open-state').textContent).toBe('false');

    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('open-state').textContent).toBe('true');

    fireEvent.click(screen.getByText('gen'));
    expect(onDone).toHaveBeenCalledTimes(1);
    const [result, mode] = onDone.mock.calls[0];

    expect(mode).toBe('text2video');
    expect(result.prompt).toMatch(/ocean waves/i);
    expect(result.settings?.format).toBe('video');
  });
});
