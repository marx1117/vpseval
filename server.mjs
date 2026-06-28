/**
 * Local AI proxy + RAG — run with: node server.mjs
 */
import http from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Build a custom http agent that ignores proxy
const directAgent = new http.Agent({ keepAlive: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4399;
const OLLAMA_CHAT = 'http://localhost:11434/api/chat';
const MODEL = 'qwen3.5:4b';
const TOP_K = 3;

// ========== Load knowledge base ==========
let articles = [];
try {
  const raw = readFileSync(resolve(__dirname, 'scripts/articles.json'), 'utf8');
  articles = JSON.parse(raw);
} catch (e) {
  console.warn('RAG index not found, run: node scripts/export-articles.mjs');
}

// ========== Keyword-based retrieval ==========
function tokenize(text) {
  const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').toLowerCase();
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  const bigrams = [];
  for (let i = 0; i < cleaned.length - 1; i++) {
    bigrams.push(cleaned.slice(i, i + 2));
  }
  return { words, bigrams };
}

function retrieve(query) {
  if (!articles.length) return [];
  const q = tokenize(query);
  const scored = articles.map(a => {
    const doc = tokenize(a.title + ' ' + a.summary + ' ' + a.content.slice(0, 2000));
    const wordSet = new Set(doc.words);
    const bigramSet = new Set(doc.bigrams);
    let score = 0;
    for (const w of q.words) {
      if (wordSet.has(w)) score += 2;
    }
    for (const b of q.bigrams) {
      if (bigramSet.has(b)) score += 1;
    }
    for (const w of q.words) {
      if (a.title.toLowerCase().includes(w)) score += 3;
    }
    return { score, article: a };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, TOP_K);
}

// ========== Think-tag stripping (multi-layer defense) ==========
function stripThink(text) {
  let cleaned = text;

  // Layer 1: Remove qwen3 template tokens (<|im_start|> ... <|im_end|>)
  cleaned = cleaned.replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/g, '').trim();

  // Layer 2: Remove <think>...</think> blocks (loop for nested/multiple)
  // Use a while loop because some models nest or chain think blocks
  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    // Match <think> with any case, possible attributes, across lines
    cleaned = cleaned.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
  }

  // Layer 3: If <think> still exists (unclosed), find LAST </think> and take everything after
  // If no closing tag, truncate at the opening tag
  if (cleaned.includes('<think>') || cleaned.includes('<think>')) {
    const lastCloseIdx = Math.max(
      cleaned.lastIndexOf('<｜end▁of▁thinking｜>'),
      cleaned.lastIndexOf('</think>'),
      cleaned.lastIndexOf('</think>'),
    );
    if (lastCloseIdx > -1) {
      cleaned = cleaned.slice(lastCloseIdx + 8); // length of '</think>'
    } else {
      const firstOpenIdx = Math.min(
        ...['<think>', '<think>', '<think', '<think']
          .map(t => cleaned.indexOf(t))
          .filter(i => i > -1)
      );
      if (firstOpenIdx > -1) cleaned = cleaned.slice(0, firstOpenIdx);
    }
  }

  // Layer 4: Remove qwen3 special markers
  cleaned = cleaned.replace(/<\|end_of_thinking\|>/gi, '');
  cleaned = cleaned.replace(/<\|think\|>/gi, '');
  cleaned = cleaned.replace(/<\|\/\s*think\s*\|>/gi, '');
  cleaned = cleaned.replace(/<\|\s*think\s*\|>/gi, '');

  // Layer 5: Remove leading English analysis paragraphs
  // More aggressive — strip any block that looks like English reasoning before the first Chinese character
  const firstChineseIdx = cleaned.search(/[\u4e00-\u9fa5]/);
  if (firstChineseIdx > 0) {
    const prefix = cleaned.slice(0, firstChineseIdx);
    // Only strip if the prefix is mostly English/reasoning
    const chineseInPrefix = (prefix.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalInPrefix = prefix.replace(/\s/g, '').length;
    if (totalInPrefix > 0 && chineseInPrefix / totalInPrefix < 0.1) {
      cleaned = cleaned.slice(firstChineseIdx);
    }
  }

  // Layer 6: Remove isolated English lines at the start (bulletproof)
  cleaned = cleaned.replace(/^[A-Z][^\u4e00-\u9fa5]*?\n/gm, '');
  cleaned = cleaned.replace(/^(?:Okay|Alright|Let me|I need|The user|First|Based on|Now|Wait|Hmm|Let's|This means|We need|Actually|So,)[^\u4e00-\u9fa5]{10,}\n/gim, '');

  return cleaned.trim();
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ========== Lightweight Markdown → HTML ==========
function renderMarkdown(md) {
  let text = md;

  // Pre-processing: convert tab-separated tables to markdown pipe tables
  // Find blocks of consecutive lines with the same tab-count (≥2 columns)
  text = text.replace(/^([\t ][^\n]+\n){2,}/gm, (block) => {
    const lines = block.trim().split('\n');
    const allTabbed = lines.every(l => l.includes('\t') || (l.match(/\s{2,}/g) || []).length >= 1);
    if (!allTabbed || lines.length < 2) return block;
    // Split each line by tabs or 2+ spaces
    const cells = lines.map(l => l.split(/[\t]+|\s{2,}/g).map(c => c.trim()).filter(c => c));
    const colCount = cells[0].length;
    if (colCount < 2) return block;
    // All lines should have same column count
    const uniform = cells.every(c => c.length === colCount);
    if (!uniform) return block;
    const pipeLines = cells.map(c => '| ' + c.join(' | ') + ' |');
    const sep = '| ' + Array(colCount).fill('---').join(' | ') + ' |';
    return '\n' + pipeLines[0] + '\n' + sep + '\n' + pipeLines.slice(1).join('\n') + '\n';
  });
  text = text.replace(/<table>([\s\S]*?)<\/table>/gi, (_, content) => {
    const lines = [];
    content.replace(/<tr>([\s\S]*?)<\/tr>/gi, (_, row) => {
      const cells = [];
      row.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, (_, cell) => cells.push(cell.trim().replace(/\n/g, ' ')));
      if (cells.length) lines.push('| ' + cells.join(' | ') + ' |');
    });
    if (lines.length > 1) {
      const sep = '| ' + lines[0].split('|').slice(1, -1).map(() => '---').join(' | ') + ' |';
      return '\n' + lines[0] + '\n' + sep + '\n' + lines.slice(1).join('\n') + '\n';
    }
    return content;
  });

  // Strip stray HTML tags (keep inner content) — except code/pre
  text = text.replace(/<\/?(?:div|span|p|br\s*\/?|em|i|b|u|s|sub|sup|font|center|align)\b[^>]*>/gi, '');

  let html = escapeHtml(text);

  // 0. Handle code blocks first
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2 overflow-x-auto text-sm"><code>${code.trim()}</code></pre>`
  );

  // 1. Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // 2. Handle pipe tables
  html = html.replace(/(\|[^\n]+\|\n)(\|[-:\s|]+\|\n)((?:\|[^\n]+\|\n?)+)/g, (_, header, _sep, rows) => {
    const hCells = header.split('|').filter(c => c.trim()).map(c => `<th class="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200 dark:border-gray-700">${c.trim()}</th>`).join('');
    const rRows = rows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td class="px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table class="w-full my-3 border-collapse"><thead><tr>${hCells}</tr></thead><tbody>${rRows}</tbody></table>`;
  });

  // 3. Handle headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>');

  // 4. Handle bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // 5. Handle unordered lists
  html = html.replace(/^(?:^[-*] .+(\n|$))+/gm, (match) => {
    const items = match.split('\n').filter(line => line.trim()).map(line =>
      `<li class="ml-4 mb-1">${line.replace(/^[-*] /, '')}</li>`
    ).join('');
    return `<ul class="list-disc my-2">${items}</ul>`;
  });

  // 6. Handle ordered lists
  html = html.replace(/^(?:^\d+\.\s+.+(\n|$))+/gm, (match) => {
    const items = match.split('\n').filter(line => line.trim()).map(line =>
      `<li class="ml-4 mb-1">${line.replace(/^\d+\.\s+/, '')}</li>`
    ).join('');
    return `<ul class="list-decimal my-2">${items}</ul>`;
  });

  // 7. Handle horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-3 border-gray-200 dark:border-gray-700">');

  // 8. Wrap remaining text blocks in paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-4]|ul|ol|table|pre|hr)/.test(trimmed)) return trimmed;
    return `<p class="mb-2">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// ========== HTTP Server ==========
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const reqUrl = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (reqUrl.pathname !== '/api/chat') {
    res.writeHead(404);
    return res.end('Not found');
  }

  const query = reqUrl.searchParams.get('q') || '';
  if (!query.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: '请输入问题' }));
  }

  const results = retrieve(query);
  let contextBlock = '';
  if (results.length > 0) {
    contextBlock = results.map((r, i) =>
      `[知识${i + 1}] 《${r.article.title}》：${r.article.summary}。${r.article.content.slice(0, 800)}`
    ).join('\n\n');
  }

  const messages = [
    {
      role: 'system',
      content: `你是 VPS Eval（vpseval.com）的AI助手，帮用户选VPS、解答技术问题。你的身份是用过很多VPS的技术博主。

【格式规则】
- 只输出简体中文
- 用纯 Markdown：表格用 | 列 | 列 |，标题用 ## ###
- 不要 <think>、<table>、<tr> 等 HTML 标签

【写作风格】
- 用真人语气，像论坛回帖或写博客，不要像写报告
- 长短句交替，别每句话一样长
- 用"说实话""其实""基本来说""用过就知道"这类口语衔接
- 用"我"发表观点，不说"我们推荐"
- 知识库提供了数据就引用具体数字，没提供就说"延迟偏高""价格适中"，**禁止编造数字**
- 可以说某家某些方面不好，真人博主不会什么都夸
- 不要用"请""您"，直接说"你"

【禁用词】
禁止：总而言之、综上所述、值得注意的是、不容错过、毋庸置疑、毫无疑问、为您带来、极致体验、一站式、展现、呈现
禁止："不仅...而且..."堆叠、"无论...还是...都能..."句式、"从...到...再到..."三连
禁止："进行"当万能动词（"进行分析"→"分析"）、"该/其"当代词（→"这个/它"）
禁止：结尾说"祝你使用愉快""有任何问题随时问我"之类客服套话

【内容策略】
- 像第三方博主写测评，基于数据和实测
- 推荐时说"XX在延迟上表现更好"而不是"推荐买XX"
- 不要主动提到优惠码、促销、限时活动
- 商家链接和正文其他链接格式一致

【知识边界】
- 知识库没有的信息，诚实说"这个我目前没有详细数据"
- 不要编造延迟数据、价格、配置

=== 知识库 ===
${contextBlock || '（暂无相关知识库文章）'}`,
    },
    { role: 'user', content: query },
  ];

  try {
    const body = JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      options: { temperature: 0.1, num_predict: 1024 },
    });

    console.log(`[REQ] ${query.slice(0, 50)}...`);

    const data = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 11434,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        agent: directAgent,
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(e); }
        });
      });
      req.on('error', (e) => { console.error('[OLLAMA ERROR]', e.message); reject(e); });
      req.setTimeout(60000, () => { req.destroy(); reject(new Error('timeout')); });
      req.write(body);
      req.end();
    });

    const rawText = data.message?.content || data.response || '';
    console.log(`[RAW] ${rawText.slice(0, 120).replace(/\n/g, ' ')}`);

    const text = stripThink(rawText);
    console.log(`[CLEAN] ${text.slice(0, 80).replace(/\n/g, ' ')}`);

    // Quick check: does clean text still contain English think/analysis?
    if (/^(?:Okay|Let me|I need|The user|First|Based on)\b/i.test(text.trim())) {
      console.log('[WARN] stripThink may have missed English preamble');
    }
    if (/think/i.test(text.slice(0, 100))) {
      console.log('[WARN] clean output still contains "think"');
    }

    const htmlBody = renderMarkdown(text);

    const html = `<div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-400 mb-1">${escapeHtml(query)}</p>
        <div class="text-base text-gray-700 dark:text-gray-300 leading-relaxed prose-sm">${htmlBody}</div>
      </div>
    </div>`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch (e) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `AI 暂不可用：${e.message}` }));
  }
}).listen(PORT, () => {
  console.log(`AI proxy + RAG → http://localhost:${PORT}/api/chat?q=什么是CN2GIA`);
  console.log(`Model: ${MODEL} | Articles: ${articles.length}`);
});
