export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

interface TorrentRecord {
  infoHash: string | null;
  isBest: boolean;
  releaseGroup: string;
  tracker: string;
  url: string;
  groupedUrl: string;
  dualAudio: boolean;
  files: { name: string; length: number }[];
  tags: string[];
}

interface SeaDexEntry {
  alID: number;
  notes: string;
  incomplete: boolean;
  theoreticalBest: string;
  comparison: string;
  expand: { trs: TorrentRecord[] };
}

// Build a magnet link from an infohash and file names
function buildMagnet(infoHash: string, files: { name: string }[], releaseGroup: string): string {
  const trackers = [
    'udp://open.demonii.com:1337/announce',
    'udp://tracker.openbittorrent.com:80',
    'udp://tracker.coppersurfer.tk:6969',
    'udp://glotorrents.pw:6969/announce',
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://torrent.gresille.org:80/announce',
    'udp://p4p.arenabg.com:1337',
    'udp://tracker.leechers-paradise.org:6969',
  ];

  const dn = encodeURIComponent(files[0]?.name || releaseGroup);
  const tr = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash}&dn=${dn}${tr}`;
}

// Check if a torrent's files contain a specific episode
function torrentHasEpisode(files: { name: string }[], epNum: number): boolean {
  if (files.length === 0) return false;

  // If it's a single-file torrent (one episode), always match
  if (files.length === 1) return true;

  const padded2 = epNum.toString().padStart(2, '0');
  const padded3 = epNum.toString().padStart(3, '0');
  const padded4 = epNum.toString().padStart(4, '0');

  return files.some(f => {
    const name = f.name;
    return (
      name.includes(`- ${padded2}`) ||
      name.includes(`- ${padded3}`) ||
      name.includes(`- ${padded4}`) ||
      name.includes(`- ${epNum} `) ||
      name.includes(`[${padded2}]`) ||
      name.includes(`[${padded3}]`) ||
      name.includes(`[${padded4}]`) ||
      new RegExp(`E${padded2}[^0-9]`).test(name) ||
      new RegExp(`E${padded3}[^0-9]`).test(name)
    );
  });
}

async function fetchSeaDexByAnilistId(anilistId: number, epNum: number) {
  const url = `https://releases.moe/api/collections/entries/records?filter=alID=${anilistId}&expand=trs&perPage=1`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const entry: SeaDexEntry = data?.items?.[0];
  if (!entry) return null;

  const trs: TorrentRecord[] = entry.expand?.trs || [];

  // Only use public tracker torrents (infohash available, not private)
  const publicTorrents = trs.filter(t =>
    t.infoHash &&
    t.infoHash !== '<redacted>' &&
    (t.tracker === 'nyaa' || t.tracker === 'animetosho' || !t.tracker.includes('private'))
  );

  // First try: best torrents that contain this episode
  const bestWithEp = publicTorrents.filter(t => t.isBest && torrentHasEpisode(t.files, epNum));
  if (bestWithEp.length > 0) {
    const t = bestWithEp[0];
    return {
      magnet: buildMagnet(t.infoHash!, t.files, t.releaseGroup),
      releaseGroup: t.releaseGroup,
      isBest: true,
      notes: entry.notes,
      theoreticalBest: entry.theoreticalBest,
      tracker: t.tracker,
      url: t.url,
      groupedUrl: t.groupedUrl,
    };
  }

  // Second try: any public torrent with this episode
  const anyWithEp = publicTorrents.filter(t => torrentHasEpisode(t.files, epNum));
  if (anyWithEp.length > 0) {
    const t = anyWithEp[0];
    return {
      magnet: buildMagnet(t.infoHash!, t.files, t.releaseGroup),
      releaseGroup: t.releaseGroup,
      isBest: t.isBest,
      notes: entry.notes,
      theoreticalBest: entry.theoreticalBest,
      tracker: t.tracker,
      url: t.url,
      groupedUrl: t.groupedUrl,
    };
  }

  // Third try: best torrent regardless of episode (season pack or batch)
  const bestAny = publicTorrents.filter(t => t.isBest);
  if (bestAny.length > 0) {
    const t = bestAny[0];
    return {
      magnet: buildMagnet(t.infoHash!, t.files, t.releaseGroup),
      releaseGroup: t.releaseGroup,
      isBest: true,
      notes: entry.notes,
      theoreticalBest: entry.theoreticalBest,
      tracker: t.tracker,
      url: t.url,
      groupedUrl: t.groupedUrl,
    };
  }

  // Return metadata even if no playable torrent found
  return {
    magnet: '',
    releaseGroup: trs[0]?.releaseGroup || '',
    isBest: false,
    notes: entry.notes,
    theoreticalBest: entry.theoreticalBest,
    tracker: trs[0]?.tracker || '',
    url: trs[0]?.url || '',
    groupedUrl: trs[0]?.groupedUrl || '',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const anilistId = parseInt(searchParams.get('anilistId') || '0');
  const ep = parseInt(searchParams.get('ep') || '1');

  if (!anilistId) return NextResponse.json({ error: 'Missing anilistId' }, { status: 400 });

  try {
    const result = await fetchSeaDexByAnilistId(anilistId, ep);
    return NextResponse.json(result || { magnet: '', error: 'No SeaDex entry found' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
