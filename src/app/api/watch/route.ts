import { fetchEpisodes, fetchStreamLinks } from '@/lib/consumet';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const ep = parseInt(searchParams.get('ep') || '1');

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  try {
    const info = await fetchEpisodes(title);
    if (!info || !info.episodes || info.episodes.length === 0) {
      return NextResponse.json({ error: 'No episodes found' }, { status: 404 });
    }

    // Find the matching episode
    const episode = info.episodes.find((e: any) => e.number === ep) || info.episodes[0];
    
    // Fetch stream links for that episode
    const streamLinks = await fetchStreamLinks(episode.id, episode.provider);
    
    return NextResponse.json({
      ...streamLinks,
      episodeId: episode.id,
      episodeTitle: episode.title,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
