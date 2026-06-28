#!/usr/bin/env node
/**
 * Export articles from lib/articles.ts to JSON for server.mjs RAG
 * Run: node scripts/export-articles.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../src/lib/articles.ts'), 'utf8');

// Extract articles array with a simple state machine
const articles = [];
let i = src.indexOf('export const articles');
while (i < src.length) {
  const slugMatch = src.slice(i).match(/slug:\s*'([^']+)'/);
  if (!slugMatch) break;
  
  const blockStart = i;
  i += slugMatch.index;
  
  // Find title
  const titleMatch = src.slice(i).match(/title:\s*'([^']+)'/);
  // summary
  const summaryMatch = src.slice(i).match(/summary:\s*'([^']+)'/);
  // Find content (backtick string)
  const contentStart = src.indexOf('content: `', i);
  if (contentStart < 0) break;
  let j = contentStart + 11;
  let content = '';
  while (j < src.length) {
    if (src[j] === '`' && src[j-1] !== '\\') break;
    content += src[j];
    j++;
  }
  
  if (titleMatch && summaryMatch) {
    articles.push({
      slug: slugMatch[1],
      title: titleMatch[1],
      summary: summaryMatch[1],
      content: content.trim(),
    });
  }
  
  // Move past this article
  i = j + 1;
  if (i - blockStart < 50) i = blockStart + 50; // safety
}

writeFileSync(
  resolve(__dirname, '../scripts/articles.json'),
  JSON.stringify(articles, null, 2),
  'utf8'
);
console.log(`Exported ${articles.length} articles to scripts/articles.json`);
