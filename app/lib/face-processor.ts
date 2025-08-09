// app/lib/face-processor.ts
// Face Detection & Generation Pipeline (Platzhalter-Version, startfähig)
//
// - detectFaces(imageUrl): liefert Mock-Bounding-Boxes + optionale Embeddings
// - generateWithFace(prompt, faceData, settings): liefert Mock-Image-URL
// - kleine In-Memory-Datenbank (save/get/list/delete)
// - klare Typen für einfache Integration in UPM-Flows

// --- gemeinsame Typen ---

export type UPMSettings = Record<string, any> & {
  format?: 'image';
  model?: string;
  negativePrompt?: string;
  safety?: 'none' | 'medium' | 'strict';
  quality?: 'low' | 'medium' | 'high';
};

export type BoundingBox = { x: number; y: number; w: number; h: number };

export type FaceLandmarks = {
  left_eye?: [number, number];
  right_eye?: [number, number];
  nose?: [number, number];
  mouth_left?: [number, number];
  mouth_right?: [number, number];
};

export type DetectedFace = {
  id: string;
  box: BoundingBox;
  conf: number;                // 0..1
  landmarks?: FaceLandmarks;
  embedding?: number[];        // z.B. 128/512-dim
  cropUrl?: string;            // Vorschau (Mock)
  quality?: 'low' | 'medium' | 'high';
  meta?: Record<string, any>;
};

export type FaceData = {
  id?: string;
  name?: string;
  imageUrl?: string;           // Original- oder Crop-Bild
  embedding?: number[];        // zur Identitätswiedererkennung
  tags?: string[];
  createdAt?: number;
};

// --- Hilfsfunktionen (Mocks) ---

function pseudoRandom(seed: number) {
  // deterministischer PRNG (xorshift-ish)
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  return () => {
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    // 0..1
    return (x >>> 0) / 0xffffffff;
  };
}

function mockEmbedding(seed: number, dim = 128): number[] {
  const rnd = pseudoRandom(seed);
  const arr = Array(dim).fill(0).map(() => Number((rnd() * 2 - 1).toFixed(6)));
  return arr;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// --- FaceProcessor ---

export class FaceProcessor {
  // simple In-Memory "DB"
  private db = new Map<string, FaceData>();

  constructor() {
    // optional: warmup logs
    // console.log('👤 FaceProcessor initialized (placeholder)');
  }

  /**
   * Mock: erkennt 1–3 Gesichter und erzeugt Boxen/Embeddings
   * In echt: MediaPipe/InsightFace/OpenCV aufrufen.
   */
  async detectFaces(imageUrl: string): Promise<DetectedFace[]> {
    // einfache, deterministische Randomisierung anhand der URL-Länge
    const seed = imageUrl.length + Date.now() % 1000;
    const rnd = pseudoRandom(seed);

    const faceCount = 1 + Math.floor(rnd() * 3); // 1..3
    const faces: DetectedFace[] = [];

    for (let i = 0; i < faceCount; i++) {
      // "zufällige" Boxen innerhalb eines fiktiven 1024x768 Bildraums
      const w = 140 + Math.floor(rnd() * 160);
      const h = 140 + Math.floor(rnd() * 160);
      const x = Math.floor(rnd() * (1024 - w));
      const y = Math.floor(rnd() * (768 - h));
      const conf = Number((0.75 + rnd() * 0.24).toFixed(2));

      const id = `face_${seed}_${i}`;
      const emb = mockEmbedding(seed + i);
      const landmarks: FaceLandmarks = {
        left_eye: [clamp(x + w * 0.32, 0, 1023), clamp(y + h * 0.38, 0, 767)] as [number, number],
        right_eye: [clamp(x + w * 0.68, 0, 1023), clamp(y + h * 0.38, 0, 767)] as [number, number],
        nose: [clamp(x + w * 0.5, 0, 1023), clamp(y + h * 0.55, 0, 767)] as [number, number],
      };

      faces.push({
        id,
        box: { x, y, w, h },
        conf,
        landmarks,
        embedding: emb,
        cropUrl: `https://picsum.photos/seed/${encodeURIComponent(id)}/256/256`,
        quality: conf > 0.9 ? 'high' : conf > 0.82 ? 'medium' : 'low',
        meta: { source: imageUrl }
      });
    }

    return faces;
  }

  /**
   * Mock: Face-Conditioned Image-Generation
   * In echt: IP-Adapter/LoRA/FaceID-Konditionierung (z. B. über SD-ComfyUI) verwenden.
   */
  async generateWithFace(prompt: string, faceData: FaceData, settings: UPMSettings): Promise<string> {
    // "Speichere" Face, falls neu
    const id = faceData.id ?? `saved_${Date.now()}`;
    const safe: FaceData = {
      id,
      name: faceData.name ?? 'Unnamed Face',
      imageUrl: faceData.imageUrl,
      embedding: faceData.embedding ?? mockEmbedding(id.length),
      tags: faceData.tags ?? [],
      createdAt: faceData.createdAt ?? Date.now(),
    };
    this.db.set(id, safe);

    // Platzhalter: generierte Bild-URL
    const url = `https://picsum.photos/seed/facegen_${encodeURIComponent(id)}_${Date.now()}/768/768`;

    // In echt:
    // - Prompt + negativePrompt + settings → Pipeline-Call
    // - Face-Embedding/Bild als Konditionierung → IP-Adapter/FaceID
    // - Identity preservation: Stochastic Restoration, CFG-Tuning, ID-Loss o.Ä.
    // - Style-Consistency: Style-LoRA/Prompt-Templates

    return url;
  }

  // ---- einfache "DB"-Utilities (optional nützlich) ----

  saveFace(face: FaceData): FaceData {
    const id = face.id ?? `saved_${Date.now()}`;
    const stored = { ...face, id, createdAt: face.createdAt ?? Date.now() };
    this.db.set(id, stored);
    return stored;
  }

  getFace(id: string): FaceData | undefined {
    return this.db.get(id);
  }

  listFaces(): FaceData[] {
    return Array.from(this.db.values()).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  deleteFace(id: string): boolean {
    return this.db.delete(id);
  }
}

// Default-Instanz für bequeme Nutzung
const faceProcessor = new FaceProcessor();
export default faceProcessor;
