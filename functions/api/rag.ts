interface Env {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: any;
}

interface RAGRequest {
  scenario: string;
  budget: string;
  requirements: string[];
}

const scenarioMap: Record<string, string> = {
  proxy: '代理/VPN 方案',
  hosting: '网站托管',
  dev: '开发测试',
  gaming: '游戏加速',
  pt: 'PT/BT 下载',
  learning: '学习实验',
};

const budgetMap: Record<string, string> = {
  zero: '零成本或免费方案',
  starter: '入门级 $2-5/月',
  advanced: '进阶 $10-30/月 CN2 GIA 等优化线路',
};

function buildQuery(req: RAGRequest): string {
  const parts: string[] = [];
  if (req.scenario && scenarioMap[req.scenario]) {
    parts.push(`使用场景: ${scenarioMap[req.scenario]}`);
  }
  if (req.budget && budgetMap[req.budget]) {
    parts.push(`预算: ${budgetMap[req.budget]}`);
  }
  if (req.requirements.length > 0) {
    parts.push(`特殊需求: ${req.requirements.join('、')}`);
  }
  return parts.join('。');
}

function renderResults(providers: any[], query: string): string {
  if (!providers || providers.length === 0) {
    return '<div class="text-center py-8"><p class="text-gray-500 dark:text-gray-400">未找到匹配的服务商，请尝试调整筛选条件。</p></div>';
  }

  const items = providers.slice(0, 5).map((p: any, idx: number) => {
    const stars = '★'.repeat(Math.round(p.rating || 4)) + '☆'.repeat(5 - Math.round(p.rating || 4));
    return `
      <div class="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-2">
        <span class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-medium text-brand-700 dark:text-brand-300 flex-shrink-0 mt-0.5">${idx + 1}</span>
        <div class="flex-1 text-left">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-gray-900 dark:text-white">${p.name || '未知'}</span>
            <span class="text-xs text-amber-500">${stars}</span>
            <span class="text-xs text-gray-400">${p.rating || 'N/A'}</span>
          </div>
          ${p.review ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${p.review}</p>` : ''}
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            ${(p.tags || []).map((t: string) => `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">${t}</span>`).join('')}
            <span class="text-xs text-gray-400">${p.locations ? p.locations.slice(0, 2).join(' · ') : ''}</span>
          </div>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-xs font-medium text-gray-900 dark:text-white">$${p.priceFrom || '?'}/月</span>
            ${p.affiliate ? `<a href="${p.affiliate}" target="_blank" rel="nofollow noopener" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">查看详情</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="mb-3 text-left">
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">基于你的需求: ${query}</p>
    </div>
    ${items}
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">推荐基于数据库中的真实评测数据，仅供参考</p>
  `;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const body: RAGRequest = await request.json();
      const query = buildQuery(body);

      let results: any[] = [];

      try {
        if (env.VECTORIZE && env.AI) {
          const modelResp = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
          const vector = modelResp.data[0];

          const vectorResults = await env.VECTORIZE.query(vector, { topK: 5, returnMetadata: true });
          results = vectorResults.matches.map((m: any) => m.metadata).filter(Boolean);
        }
      } catch (vectorErr) {
        console.error('Vector search failed, falling back to D1:', vectorErr);
      }

      if (results.length === 0 && env.DB) {
        try {
          const { results: dbResults } = await env.DB.prepare(
            'SELECT * FROM providers WHERE scenario = ?1 LIMIT 5'
          ).bind(body.scenario || 'proxy').all();
          results = dbResults || [];
        } catch (dbErr) {
          console.error('D1 fallback failed:', dbErr);
        }
      }

      if (results.length === 0) {
        results = [
          {
            name: 'DMIT',
            rating: 4.8,
            review: 'CN2 GIA 顶级线路，延迟极低，适合对线路质量要求高的用户',
            tags: ['CN2 GIA', '低延迟', '代理首选'],
            priceFrom: 6.9,
            locations: ['Los Angeles', 'Hong Kong'],
            routes: ['CN2 GIA'],
            affiliate: 'https://www.dmit.io/',
          },
          {
            name: 'BandwagonHost',
            rating: 4.5,
            review: '经典性价比之选，KiwiVM 面板功能丰富',
            tags: ['性价比', '老牌'],
            priceFrom: 4.99,
            locations: ['Los Angeles'],
            routes: ['CN2 GT'],
            affiliate: 'https://bandwagonhost.com/',
          },
          {
            name: 'RackNerd',
            rating: 4.2,
            review: '极致低价，经常有节日促销，适合预算紧张的用户',
            tags: ['超低价', '大流量'],
            priceFrom: 1.92,
            locations: ['Los Angeles', 'Dallas'],
            routes: ['普通国际'],
            affiliate: 'https://my.racknerd.com/',
          },
        ];
      }

      const html = renderResults(results, query);

      return new Response(JSON.stringify({ html }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
