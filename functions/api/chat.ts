/**
 * Cloudflare Pages Function — AI 对话 API（RAG 增强）
 * 替代本地 server.mjs，使用 Cloudflare Workers AI + Vectorize
 *
 * 请求: GET /api/chat?q=你的问题
 * 响应: { html: "..." }
 */

// ========== 模型配置 ==========
const LLM_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';       // Qwen3 MoE，中文优化
const EMBED_MODEL = '@cf/baai/bge-m3';                // BAAI 多语言 embedding，中文友好
const ACCOUNT_ID = '23c4cb154edbe3e149ae79228399dfad';
const TOP_K = 3;  // 检索返回 Top-K 文档

// ========== HTML 转义 ==========
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ========== 轻量 Markdown → HTML 渲染 ==========
function renderMarkdown(md: string): string {
  let text = md;

  // Pre-process: tab-separated tables → pipe tables
  text = text.replace(/^([\t ][^\n]+\n){2,}/gm, (block) => {
    const lines = block.trim().split('\n');
    const allTabbed = lines.every(l => l.includes('\t') || (l.match(/\s{2,}/g) || []).length >= 1);
    if (!allTabbed || lines.length < 2) return block;
    const cells = lines.map(l => l.split(/[\t]+|\s{2,}/g).map(c => c.trim()).filter(c => c));
    const colCount = cells[0].length;
    if (colCount < 2) return block;
    const uniform = cells.every(c => c.length === colCount);
    if (!uniform) return block;
    const pipeLines = cells.map(c => '| ' + c.join(' | ') + ' |');
    const sep = '| ' + Array(colCount).fill('---').join(' | ') + ' |';
    return '\n' + pipeLines[0] + '\n' + sep + '\n' + pipeLines.slice(1).join('\n') + '\n';
  });

  // Strip stray HTML tags (keep inner content)
  text = text.replace(/<\/?(?:div|span|p|br\s*\/?|em|i|b|u|s|sub|sup|font|center|align)\b[^>]*>/gi, '');

  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2 overflow-x-auto text-sm"><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Pipe tables
  html = html.replace(/(\|[^\n]+\|\n)(\|[-:\s|]+\|\n)((?:\|[^\n]+\|\n?)+)/g, (_, header, _sep, rows) => {
    const hCells = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th class="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200 dark:border-gray-700">${c.trim()}</th>`).join('');
    const rRows = rows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td class="px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table class="w-full my-3 border-collapse"><thead><tr>${hCells}</tr></thead><tbody>${rRows}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Unordered lists
  html = html.replace(/^(?:^[-*] .+(\n|$))+/gm, (match) => {
    const items = match.split('\n').filter((line: string) => line.trim()).map((line: string) =>
      `<li class="ml-4 mb-1">${line.replace(/^[-*] /, '')}</li>`
    ).join('');
    return `<ul class="list-disc my-2">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^(?:^\d+\.\s+.+(\n|$))+/gm, (match) => {
    const items = match.split('\n').filter((line: string) => line.trim()).map((line: string) =>
      `<li class="ml-4 mb-1">${line.replace(/^\d+\.\s+/, '')}</li>`
    ).join('');
    return `<ul class="list-decimal my-2">${items}</ul>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-3 border-gray-200 dark:border-gray-700">');

  // Paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-4]|ul|ol|table|pre|hr)/.test(trimmed)) return trimmed;
    return `<p class="mb-2">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// ========== System Prompt ==========
function buildSystemPrompt(contextBlock: string): string {
  return `你是 VPS Eval（vpseval.com）的AI助手，帮用户选VPS、解答技术问题。你的身份是用过很多VPS的技术博主。

【格式规则】
- 只输出简体中文
- 用纯 Markdown：表格用 | 列 | 列 |，标题用 ## ###
- 不要  thinking、<table>、<tr> 等 HTML 标签

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
${contextBlock || '（暂无相关知识库文章）'}`;
}

// ========== Pages Function Handler ==========
export const onRequest: PagesFunction<{ AI: any; VECTORIZE: any; CF_API_TOKEN: string }> = async (context) => {
  const { request, env } = context;

  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const reqUrl = new URL(request.url);
  const query = reqUrl.searchParams.get('q') || '';

  if (!query.trim()) {
    return new Response(JSON.stringify({ error: '请输入问题' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // ===== Step 1: RAG 检索 — 向量搜索知识库 =====
    let contextBlock = '';
    try {
      // 生成查询向量 — 用 REST API（与 seed-vectorize 同通道，确保向量空间一致）
      const embedRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${EMBED_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: [query] }),
        }
      );
      const embedJson: any = await embedRes.json();
      if (!embedJson.success) throw new Error(`Embed API: ${JSON.stringify(embedJson.errors)}`);
      const rawVec: number[] = embedJson.result.data[0];
      const norm = Math.sqrt(rawVec.reduce((s: number, v: number) => s + v * v, 0));
      const queryVector = norm === 0 ? rawVec : rawVec.map((v: number) => v / norm);

      // 向量搜索
      const vectorResults = await env.VECTORIZE.query(queryVector, {
        topK: TOP_K,
        returnMetadata: true,
      });
      if (vectorResults.matches?.length > 0) {
        contextBlock = vectorResults.matches.map((m: any, i: number) => {
          const meta = m.metadata || {};
          return `[知识${i + 1}] 《${meta.title || '未知'}》：${meta.summary || ''}。${meta.content || ''}`;
        }).join('\n\n');
      }
    } catch (e: any) {
      console.error('Vector search failed:', e.message || e);
    }

    // ===== Step 2: 调用 LLM 生成回答 =====
    const messages = [
      { role: 'system', content: buildSystemPrompt(contextBlock) },
      { role: 'user', content: query },
    ];

    const aiResult = await env.AI.run(LLM_MODEL, {
      messages,
      max_tokens: 1024,
      temperature: 0.1,
    });

    const rawText = aiResult.response || '';

    // ===== Step 3: 渲染 HTML =====
    const htmlBody = renderMarkdown(rawText);

    const html = `<div class="flex items-start gap-3">
      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <img src="/logo.svg" alt="机鉴" class="w-8 h-8 rounded-lg" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-400 mb-1">${escapeHtml(query)}</p>
        <div class="text-base text-gray-700 dark:text-gray-300 leading-relaxed prose-sm">${htmlBody}</div>
      </div>
    </div>`;

    return new Response(JSON.stringify({ html }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `AI 暂不可用：${err.message}` }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};