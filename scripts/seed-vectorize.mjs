#!/usr/bin/env node
/**
 * 知识库向量化 — 使用 Cloudflare Workers AI 生成 Embedding（与 chat.ts 查询同模型）
 *
 * 使用方式:
 *   1. export CLOUDFLARE_API_TOKEN="你的API Token"
 *   2. node scripts/export-articles.mjs   # 先生成 articles.json
 *   3. node scripts/seed-vectorize.mjs    # 生成向量（调用 Cloudflare API）
 *   4. npx wrangler vectorize insert vpseval-kb --file scripts/vectors.ndjson
 *
 * API Token 创建: https://dash.cloudflare.com/profile/api-tokens
 *   权限: Workers AI - Edit
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 尝试加载 .env（项目根目录）
try {
  const envPath = resolve(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) { /* .env not found, fall through */ }

// ========== 配置 ==========
const ACCOUNT_ID = '23c4cb154edbe3e149ae79228399dfad';
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run`;
const EMBED_MODEL = '@cf/baai/bge-m3';  // BAAI 多语言 embedding，中文友好，1024d
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const BATCH_SIZE = 5;  // 每批 5 条，避免 API 限流

// ========== 获取 API Token ==========
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!API_TOKEN) {
  console.error('请先设置 Token（二选一）:');
  console.error('  1. 写入 .env 文件: echo "CLOUDFLARE_API_TOKEN=cfut_xxx" >> .env');
  console.error('  2. 临时导出: export CLOUDFLARE_API_TOKEN="cfut_xxx"');
  console.error('获取 Token: https://dash.cloudflare.com/profile/api-tokens');
  process.exit(1);
}

// ========== 加载文章 ==========
let articles = [];
try {
  const raw = readFileSync(resolve(__dirname, 'articles.json'), 'utf8');
  articles = JSON.parse(raw);
  console.log(`Loaded ${articles.length} articles`);
} catch (e) {
  console.error('articles.json not found. Run first: node scripts/export-articles.mjs');
  process.exit(1);
}

// ========== 文本分块 ==========
function chunkArticle(article) {
  const plainText = article.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const chunks = [];
  let start = 0;
  while (start < plainText.length) {
    const end = Math.min(start + CHUNK_SIZE, plainText.length);
    const chunk = plainText.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push({
        id: `${article.slug}-${chunks.length}`,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: chunk,
      });
    }
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ========== 调用 Cloudflare Workers AI 生成嵌入（批量） ==========
async function embedBatch(texts) {
  const res = await fetch(`${CF_API}/${EMBED_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudflare API error ${res.status}: ${errText}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(`Cloudflare API error: ${JSON.stringify(json.errors)}`);
  }
  // 返回格式: { result: { data: [ [...], [...] ], shape: [...] } }
  return json.result.data;
}

// ========== L2 归一化 ==========
function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

// ========== 主流程 ==========
async function main() {
  // 1. 分块
  const allChunks = [];
  for (const article of articles) {
    const chunks = chunkArticle(article);
    allChunks.push(...chunks);
  }
  console.log(`Total chunks: ${allChunks.length}`);

  // 2. 批量生成嵌入
  const ndjsonPath = resolve(__dirname, 'vectors.ndjson');
  const ndjsonLines = [];

  const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);
  for (let batch = 0; batch < totalBatches; batch++) {
    const start = batch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allChunks.length);
    const batchChunks = allChunks.slice(start, end);
    const texts = batchChunks.map(c => `${c.title} ${c.summary} ${c.content}`);

    try {
      const vectors = await embedBatch(texts);
      for (let j = 0; j < vectors.length; j++) {
        const chunk = batchChunks[j];
        ndjsonLines.push(JSON.stringify({
          id: chunk.id,
          values: normalize(vectors[j]),
          metadata: {
            title: chunk.title,
            slug: chunk.slug,
            summary: chunk.summary,
            content: chunk.content.slice(0, 800),
          },
        }));
      }
      console.log(`[${batch + 1}/${totalBatches}] chunks ${start + 1}-${end} done`);
    } catch (e) {
      console.error(`Batch ${batch + 1} failed:`, e.message);
    }

    // 避免限流，每批之间等 500ms
    if (batch < totalBatches - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  writeFileSync(ndjsonPath, ndjsonLines.join('\n') + '\n', 'utf8');
  console.log(`\nDone! Wrote ${ndjsonLines.length} vectors to ${ndjsonPath}`);
  console.log(`\nNext step: npx wrangler vectorize insert vpseval-kb --file scripts/vectors.ndjson`);
}

main().catch(console.error);