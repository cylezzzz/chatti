// app/lib/database.ts
// Minimaler Database Layer (In-Memory) mit klaren TODO-Stellen für echte Persistenz
// - Speichert Face-Embeddings, User-Settings, Generation-Historie, Templates
// - Bietet Cosine-Similarity-Suche für Face-Embeddings
// - Startfähig ohne externe Abhängigkeiten

// ---------- Gemeinsame Typen ----------

export type FaceData = {
  id?: string;
  name?: string;
  imageUrl?: string;          // Crop/Original
  embedding?: number[];       // z.B. 128/512-dim
  tags?: string[];
  createdAt?: number;
  meta?: Record<string, any>;
};

export type GenerationRecord = {
  id: string;
  type: 'image' | 'video' | 'face' | 'code';
  prompt?: string;
  resultUrl?: string;         // Bild/Video/Asset/Zip
  settings?: Record<string, any>;
  durationMs?: number;
  createdAt: number;
};

export type UserSettings = {
  userId: string;
  presets?: Record<string, any>;
  lastUsedModel?: string;
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
  updatedAt: number;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  kind: 'component' | 'api' | 'scaffold' | 'snippet';
  payload: Record<string, any> | string; // frei
  tags?: string[];
  createdAt: number;
};

// ---------- Utility: Vektor-Ähnlichkeit ----------

function l2Normalize(vec: number[]): number[] {
  const s = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vec.map(v => v / s);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // bei L2-normalisierten Vektoren = Cosine
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- DatabaseManager (In-Memory) ----------

export class DatabaseManager {
  // TODO: Replace In-Memory mit SQLite/PostgreSQL (Prisma/Kysely/Drizzle)
  private faces = new Map<string, FaceData>();
  private generations = new Map<string, GenerationRecord>();
  private settings = new Map<string, UserSettings>();
  private templates = new Map<string, ProjectTemplate>();

  // ---------- Face Library ----------

  /**
   * Speichert ein Gesicht inkl. Embedding & Metadaten.
   * Gibt die generierte Face-ID zurück.
   */
  async saveFace(faceData: FaceData): Promise<string> {
    // TODO: Persistenz in DB + Vektorindex (z. B. pgvector, sqlite-vss)
    const faceId = faceData.id ?? id('face');
    const now = Date.now();
    const record: FaceData = {
      id: faceId,
      name: faceData.name ?? 'Unnamed Face',
      imageUrl: faceData.imageUrl,
      embedding: faceData.embedding ? l2Normalize(faceData.embedding) : undefined,
      tags: faceData.tags ?? [],
      createdAt: faceData.createdAt ?? now,
      meta: faceData.meta ?? {},
    };
    this.faces.set(faceId, record);
    return faceId;
  }

  /**
   * Vektor-Similarity-Suche (Cosine) über gespeicherte Faces.
   * Gibt nach Score absteigend sortierte Treffer zurück.
   */
  async searchSimilarFaces(embedding: number[], topK = 10, threshold = 0.3): Promise<FaceData[]> {
    // TODO: DB-seitiger ANN-Index (pgvector/HNSW) statt In-Memory
    if (!embedding?.length) return [];
    const q = l2Normalize(embedding);
    const scored: Array<{ face: FaceData; score: number }> = [];
    for (const face of this.faces.values()) {
      if (!face.embedding || face.embedding.length !== q.length) continue;
      const score = cosineSimilarity(q, face.embedding);
      if (score >= threshold) scored.push({ face, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => s.face);
  }

  async getFace(faceId: string): Promise<FaceData | undefined> {
    return this.faces.get(faceId);
  }

  async listFaces(): Promise<FaceData[]> {
    return Array.from(this.faces.values()).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async deleteFace(faceId: string): Promise<boolean> {
    return this.faces.delete(faceId);
  }

  // ---------- Generation History ----------

  async saveGeneration(rec: Omit<GenerationRecord, 'id' | 'createdAt'>): Promise<string> {
    // TODO: Persistenz in DB (mit Indizes auf type, createdAt, userId falls gewünscht)
    const genId = id('gen');
    const full: GenerationRecord = { id: genId, createdAt: Date.now(), ...rec };
    this.generations.set(genId, full);
    return genId;
  }

  async getGeneration(genId: string): Promise<GenerationRecord | undefined> {
    return this.generations.get(genId);
  }

  async listGenerations(filter?: Partial<Pick<GenerationRecord, 'type'>>): Promise<GenerationRecord[]> {
    let arr = Array.from(this.generations.values());
    if (filter?.type) arr = arr.filter(g => g.type === filter.type);
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ---------- User Settings & Presets ----------

  async saveUserSettings(userId: string, patch: Partial<UserSettings>): Promise<UserSettings> {
    // TODO: Persistenz in DB, ggf. JSONB
    const prev = this.settings.get(userId);
    const merged: UserSettings = {
      userId,
      presets: patch.presets ?? prev?.presets ?? {},
      lastUsedModel: patch.lastUsedModel ?? prev?.lastUsedModel,
      locale: patch.locale ?? prev?.locale ?? 'de-DE',
      theme: patch.theme ?? prev?.theme ?? 'system',
      updatedAt: Date.now(),
    };
    this.settings.set(userId, merged);
    return merged;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.settings.get(userId);
  }

  // ---------- Project Templates & Snippets ----------

  async saveTemplate(tpl: Omit<ProjectTemplate, 'id' | 'createdAt'>): Promise<string> {
    // TODO: Persistenz in DB
    const tplId = id('tpl');
    const full: ProjectTemplate = { id: tplId, createdAt: Date.now(), ...tpl };
    this.templates.set(tplId, full);
    return tplId;
  }

  async listTemplates(kind?: ProjectTemplate['kind']): Promise<ProjectTemplate[]> {
    let arr = Array.from(this.templates.values());
    if (kind) arr = arr.filter(t => t.kind === kind);
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

// Bequemer Default-Export
const database = new DatabaseManager();
export default database;
