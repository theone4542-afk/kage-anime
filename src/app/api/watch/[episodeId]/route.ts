import { fetchStreamLinks } from '@/lib/consumet';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  
  if (!episodeId) {
    return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
  }

  try {
    const sources = await fetchStreamLinks(episodeId);
    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stream links' }, { status: 500 });
  }
}
