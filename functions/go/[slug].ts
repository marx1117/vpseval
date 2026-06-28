interface Env {
  // Cloudflare Pages environment
}

// Affiliate 链接映射 — 与 src/lib/data.ts 中的 AFFILIATE_REDIRECTS 保持同步
const REDIRECT_MAP: Record<string, string> = {
  dmit: 'https://www.dmit.io/aff.php?aff=6460',
  bandwagon: 'https://bwh81.net/aff.php?aff=70788',
  racknerd: 'https://my.racknerd.com/aff.php?aff=7586',
  cloudcone: 'https://app.cloudcone.com/?ref=9528',
  buyvm: 'https://my.frantech.ca/aff.php?aff=6497',
  hosthatch: 'https://cloud.hosthatch.com/a/5546',
  vultr: 'https://www.vultr.com/?ref=9909229',
  digitalocean: 'https://m.do.co/c/3ed588d4a2f9',
  vps: 'https://vps.hosting/?affid=2394',
  lisa: 'https://lisahost.com/aff.php?aff=12102',
  cloudsilk: 'https://cloudsilk.io/aff.php?aff=946',
  colocrossing: 'https://cloud.colocrossing.com/aff.php?aff=2001',
  gigsgigs: 'https://clientarea.gigsgigscloud.com/?affid=4183',
  hostdare: 'https://bill.hostdare.com/aff.php?aff=4654',
  webhorizon: 'https://clients.webhorizon.net/?affid=232',
  yxvm: 'https://yxvm.com/aff.php?aff=913',
  zgovps: 'https://clients.zgovps.com/?affid=1645',
  virmach: 'https://billing.virmach.com/',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params } = context;
  const slug = params.slug as string;
  const targetUrl = REDIRECT_MAP[slug];

  if (!targetUrl) {
    return new Response('Not Found', { status: 404 });
  }

  return Response.redirect(targetUrl, 302);
};
