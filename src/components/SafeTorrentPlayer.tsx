'use client';

import dynamic from 'next/dynamic';

const TorrentPlayerComponent = dynamic(() => import('./TorrentPlayer'), { 
  ssr: false,
  loading: () => <div className="aspect-video bg-secondary/20 animate-pulse rounded-xl" />
});

export default function SafeTorrentPlayer({ magnet }: { magnet: string }) {
  return <TorrentPlayerComponent magnet={magnet} />;
}
