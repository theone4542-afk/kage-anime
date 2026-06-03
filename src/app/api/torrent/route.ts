export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// Build a magnet from an infohash
function buildMagnet(infoHash: string, name: string): string {
  const trackers = [
    'udp://open.demonii.com:1337/announce',
    'udp://tracker.openbittorrent.com:80',
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://p4p.arenabg.com:1337',
    'udp://tracker.leechers-paradise.org:6969',
  ];
  const dn = encodeURIComponent(name);
  const tr = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash}&dn=${dn}${tr}`;
}

function matchesEpisode(files: { name: string }[], epNum: number): boolean {
  if (files.length <= 1) return true; // single file = whole show or movie
  const pads = [
    epNum.toString(),
    epNum.toString().padStart(2, '0'),
    epNum.toString().padStart(3, '0'),
    epNum.toString().padStart(4, '0'),
  ];
  return files.some(f =>
    pads.some(p =>
      f.name.includes(`- ${p}`) ||
      f.name.includes(`[${p}]`) ||
      f.name.includes(` ${p} `) ||
      f.name.endsWith(` ${p}`) ||
      new RegExp(`E${p}[^0-9]`).test(f.name)
    )
  );
}

// PATH 1: SeaDex — best for completed anime
async function trySeaDex(anilistId: number, epNum: number) {
  const url = `https://releases.moe/api/collections/entries/records?filter=alID=${anilistId}&expand=trs&perPage=1`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data?.items?.[0];
  if (!entry) return null;

  const trs = (entry.expand?.trs || []) as any[];
  // Only public torrents (infohash not redacted)
  const pub = trs.filter((t: any) => t.infoHash && t.infoHash !== '<redacted>');
  if (!pub.length) return null;

  // Best match: isBest + has episode
  const pick =
    pub.find((t: any) => t.isBest && matchesEpisode(t.files || [], epNum)) ||
    pub.find((t: any) => matchesEpisode(t.files || [], epNum)) ||
    pub.find((t: any) => t.isBest) ||
    pub[0];

  if (!pick) return null;

  return {
    magnet: buildMagnet(pick.infoHash, pick.files?.[0]?.name || pick.releaseGroup || 'anime'),
    releaseGroup: pick.releaseGroup || '',
    isBest: pick.isBest || false,
    notes: entry.notes || '',
    source: 'seadex',
  };
}

// PATH 2: AnimeTosho API — works from datacenter IPs, covers airing shows
// AnimeTosho mirrors Nyaa and has a proper JSON API
async function tryAnimeTosho(title: string, romajiTitle: string, epNum: number) {
  const pads = [
    epNum.toString().padStart(2, '0'),
    epNum.toString().padStart(4, '0'),
  ];
  const titles = [...new Set([title, romajiTitle].filter(Boolean))];

  for (const t of titles) {
    for (const pad of pads) {
      // AnimeTosho search API
      const query = encodeURIComponent(`${t} ${pad}`);
      const url = `https://feed.animetosho.org/api?q=${query}&qx=1&order=seeders&hl=1&marks=1`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });
        if (!res.ok) continue;
        const items = await res.json() as any[];
        if (!items?.length) continue;

        // Prefer SubsPlease or Erai-raws, 1080p
        const scored = items
          .filter((item: any) => item.magnet_uri && item.num_seeders > 0)
          .map((item: any) => {
            let score = item.num_seeders;
            const title = (item.title || '').toLowerCase();
            if (title.includes('subsplease')) score += 10000;
            if (title.includes('erai-raws')) score += 5000;
            if (title.includes('1080p')) score += 1000;
            if (title.includes('720p')) score += 500;
            return { ...item, score };
          })
          .sort((a: any, b: any) => b.score - a.score);

        if (scored[0]?.magnet_uri) {
          return {
            magnet: scored[0].magnet_uri,
            releaseGroup: scored[0].title?.match(/^\[([^\]]+)\]/)?.[1] || 'Unknown',
            isBest: false,
            notes: '',
            source: 'animetosho',
          };
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const anilistId = parseInt(searchParams.get('anilistId') || '0');
  const title = searchParams.get('title') || '';
  const romaji = searchParams.get('romaji') || '';
  const ep = parseInt(searchParams.get('ep') || '1');

  if (!anilistId) return NextResponse.json({ error: 'Missing anilistId' }, { status: 400 });

  try {
    // Try SeaDex first (best quality, works for finished anime)
    const seadex = await trySeaDex(anilistId, ep);
    if (seadex?.magnet) return NextResponse.json(seadex);

    // Fall back to AnimeTosho (works for airing shows, not blocked by datacenter IPs)
    if (title) {
      const tosho = await tryAnimeTosho(title, romaji, ep);
      if (tosho?.magnet) return NextResponse.json(tosho);
    }

    return NextResponse.json({
      magnet: '',
      releaseGroup: '',
      isBest: false,
      notes: seadex?.notes || '',
      source: 'none',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
