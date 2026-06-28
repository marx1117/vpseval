/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DB: D1Database;
  readonly VECTORIZE: VectorizeIndex;
  readonly AI: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
