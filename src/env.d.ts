/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DB: D1Database;
  readonly VECTORIZE: VectorizeIndex;
  readonly AI: {
    run(model: string, input: {
      text?: string;
      prompt?: string;
      messages?: Array<{ role: string; content: string }>;
      max_tokens?: number;
      temperature?: number;
    }): Promise<{ response?: string; data?: Array<{ embedding: number[] }> }>;
  };
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}