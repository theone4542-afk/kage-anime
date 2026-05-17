import { NextRequest, NextResponse } from 'next/server';
import { fetchBestRelease } from '@/lib/seadex';
import { findCRWebDL } from '@/lib/nyaa';

// GET /api/torrent?title=...&romaji=...&ep=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const romaji = searchParams.get('romaji') || '';
  const ep = parseInt(searchParams.get('ep') || '1');

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  try {
    // Run SeaDex + Nyaa in parallel to save time
    const [seadex, magnet] = await Promise.all([
      fetchBestRelease(title),
      findCRWebDL(title, ep, romaji),
    ]);

    return NextResponse.json({
      magnet,
      seadex: seadex
        ? {
            bestRelease: seadex.bestRelease,
            altRelease: seadex.altRelease,
            notes: seadex.notes,
          }
        : null,
    });
  } catch (err) {
    console.error('Torrent route error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
