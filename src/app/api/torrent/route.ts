// IMPORTANT: Edge runtime runs on Cloudflare's network, NOT AWS.
// Nyaa blocks AWS (regular Vercel serverless) but NOT Cloudflare.
// This is why we MUST use edge runtime here.
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

function parseNyaaRSS(xml: string) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    const title =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
      item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const magnet =
      item.match(/<nyaa:magnetUri><!\[CDATA\[([\s\S]*?)\]\]><\/nyaa:magnetUri>/)?.[1] ||
      item.match(/<nyaa:magnetUri>([\s\S]*?)<\/nyaa:magnetUri>/)?.[1] || '';
    const seeders = parseInt(item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || '0');
    return { title, magnet, seeders };
  }).filter(r => r.magnet);
}

function pickBest(results: { title: string; magnet: string; seeders: number }[], paddedEp: string, epNum: number) {
  const matches = results.filter(r => {
    const t = r.title;
    return (
      t.includes(`- ${paddedEp}`) ||
      t.includes(`- ${epNum} `) ||
      t.includes(` ${paddedEp} `) ||
      t.includes(`[${paddedEp}]`) ||
      t.endsWith(` ${paddedEp}`) ||
      t.endsWith(`-${paddedEp}`) ||
      t.includes(`E${paddedEp}`)
    );
  });
  const pool = matches.length > 0 ? matches : results;
  pool.sort((a, b) => b.seeders - a.seeders);
  return pool[0]?.magnet || '';
}

async function searchNyaa(query: string): Promise<string> {
  const url = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&c=1_2&f=0`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
  if (!res.ok) throw new Error(`Nyaa ${res.status}`);
  return res.text();
}

async function findMagnet(title: string, romaji: string, epNum: number): Promise<string> {
  const paddedEp = epNum.toString().padStart(2, '0');
  const titles = [title, romaji].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const groups = ['SubsPlease', 'Erai-raws'];

  for (const t of titles) {
    for (const group of groups) {
      try {
        const xml = await searchNyaa(`${group} ${t} ${paddedEp}`);
        const results = parseNyaaRSS(xml);
        const match = pickBest(results, paddedEp, epNum);
        if (match) return match;
      } catch { /* try next */ }
    }
  }

  // Broader fallback — any result for title + episode
  for (const t of titles) {
    try {
      const xml = await searchNyaa(`${t} ${paddedEp}`);
      const results = parseNyaaRSS(xml);
      const match = pickBest(results, paddedEp, epNum);
      if (match) return match;
    } catch { /* try next */ }
  }

  return '';
}

async function fetchSeaDex(title: string) {
  try {
    const url = `https://releases.moe/api/collections/entries/records?filter=title~"${encodeURIComponent(title)}"&perPage=5&expand=trs`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.items;
    if (!items?.length) return null;

    const match = items.find((item: any) => {
      const t = (item.title || '').toLowerCase();
      const s = title.toLowerCase();
      return t.includes(s) || s.includes(t);
    }) || items[0];

    const trs: any[] = match.expand?.trs || [];
    const bestTrs = trs.filter((t: any) => t.isBest);
    const altTrs = trs.filter((t: any) => !t.isBest);

    return {
      bestRelease: bestTrs.map((t: any) => t.releaseGroup).filter(Boolean).join(', ') || match.bestRelease || '',
      altRelease: altTrs.map((t: any) => t.releaseGroup).filter(Boolean).join(', ') || match.altRelease || '',
      notes: match.notes || '',
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const romaji = searchParams.get('romaji') || '';
  const ep = parseInt(searchParams.get('ep') || '1');

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

  try {
    const [magnet, seadex] = await Promise.all([
      findMagnet(title, romaji, ep),
      fetchSeaDex(title),
    ]);

    return NextResponse.json({ magnet, seadex });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}
