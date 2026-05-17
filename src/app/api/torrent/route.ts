// This route is no longer used for Nyaa search.
// Nyaa/SeaDex search now happens client-side in WatchClient.tsx
// to bypass Nyaa's datacenter IP block.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Search is now handled client-side.' });
}
