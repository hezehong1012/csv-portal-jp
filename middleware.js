/**
 * Geo-based language routing — csv.format-portal.com
 *
 * Same behaviour as the tool subdomains, but the portal has five paired pages
 * (/  vs /en/, /csv-create.html vs /en/csv-create.html, ...), so the redirect
 * keeps the visitor on the equivalent page in the other language instead of
 * always dumping them on the home page.
 */

const ONE_YEAR = 60 * 60 * 24 * 365;
const CRAWLER = /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterest/i;

const toEn = (p) => (p === '/' ? '/en/' : '/en' + p);
const toJa = (p) => (p === '/en/' ? '/' : p.replace(/^\/en/, '') || '/');
const langOf = (p) => (p.startsWith('/en/') ? 'en' : 'ja');
const pageFor = (lang, path) => (lang === 'en' ? toEn(path) : toJa(path));

export default function middleware(request) {
  const url = new URL(request.url);

  // 1. explicit switch — remember it and keep the equivalent page
  const setlang = url.searchParams.get('setlang');
  if (setlang === 'ja' || setlang === 'en') {
    const target = setlang === 'en' ? toEn(toJa(url.pathname)) : toJa(url.pathname);
    return new Response(null, {
      status: 307,
      headers: {
        Location: new URL(target, url.origin).toString(),
        'Set-Cookie': `lang=${setlang}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2. crawlers are never redirected
  const ua = request.headers.get('user-agent') || '';
  if (CRAWLER.test(ua)) return;

  // 3. remembered choice
  const cookieHeader = request.headers.get('cookie') || '';
  const remembered = (cookieHeader.match(/(?:^|;\s*)lang=(ja|en)/) || [])[1];
  if (remembered) {
    const target = pageFor(remembered, url.pathname);
    if (target !== url.pathname) return Response.redirect(new URL(target, url.origin), 307);
    return;
  }

  // 4. first visit — infer from IP country
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  if (!country) return;

  const want = country === 'JP' ? 'ja' : 'en';
  if (langOf(url.pathname) === want) return;

  const target = pageFor(want, url.pathname);
  if (target !== url.pathname) return Response.redirect(new URL(target, url.origin), 307);
}

export const config = {
  matcher: [
    '/',
    '/en/',
    '/csv-create.html',
    '/en/csv-create.html',
    '/excel-convert.html',
    '/en/excel-convert.html',
    '/mojibake.html',
    '/en/mojibake.html',
    '/reading.html',
    '/en/reading.html',
  ],
};
