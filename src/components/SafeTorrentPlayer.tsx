'use client';

import dynamic from 'next/dynamic';
import { AlertTriangle } from 'lucide-react';

const TorrentPlayerComponent = dynamic(() => import('./TorrentPlayer'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-secondary/20 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Loading Player...</p>
    </div>
  ),
});

export default function SafeTorrentPlayer({ magnet }: { magnet: string }) {
  if (!magnet) {
    return (
      <div className="aspect-video bg-secondary/20 rounded-2xl flex flex-col items-center justify-center border border-white/5 text-center p-8">
        <AlertTriangle className="text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">No Torrent Found</h2>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed">
          Could not find a torrent for this episode on Nyaa. This may happen if the episode
          hasn't been released yet, or the search didn't match any results.
          Try a different episode or check back later.
        </p>
      </div>
    );
  }

  return <TorrentPlayerComponent magnet={magnet} />;
}
