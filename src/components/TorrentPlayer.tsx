'use client';

import { useEffect, useRef, useState } from 'react';
import { Info, Loader2 } from 'lucide-react';

interface TorrentPlayerProps {
  magnet: string;
}

export default function TorrentPlayer({ magnet }: TorrentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'metadata' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!magnet || typeof window === 'undefined') return;

    let client: any;

    const initWebTorrent = async () => {
      try {
        // Absolute isolation: only import inside useEffect
        const WebTorrentModule = await import('webtorrent');
        const WebTorrent = WebTorrentModule.default;
        
        client = new WebTorrent();

        client.add(magnet, (torrent: any) => {
          setStatus('metadata');
          
          const file = torrent.files.find((f: any) => 
            f.name.endsWith('.mp4') || 
            f.name.endsWith('.mkv') || 
            f.name.endsWith('.webm')
          ) || torrent.files[0];

          if (file && videoRef.current) {
            file.renderTo(videoRef.current, {
              autoplay: true,
              controls: true,
            }, (err: any) => {
              if (err) {
                setError('This format may require a local player like VLC.');
                setStatus('error');
              } else {
                setStatus('ready');
              }
            });
          }

          torrent.on('download', () => {
            setProgress(Math.round(torrent.progress * 100));
          });
        });

        client.on('error', (err: any) => {
          setError(err.message);
          setStatus('error');
        });
      } catch (err: any) {
        setError('Torrent engine failed to start.');
        setStatus('error');
      }
    };

    initWebTorrent();

    return () => {
      if (client) {
        try { client.destroy(); } catch (e) {}
      }
    };
  }, [magnet]);

  if (status === 'error') {
    return (
      <div className="aspect-video bg-secondary/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/5">
        <Info className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">PLAYBACK ERROR</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <a href={magnet} className="mt-6 bg-primary text-black px-6 py-2 rounded-xl font-bold">OPEN MAGNET</a>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {(status === 'loading' || status === 'metadata') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader2 className="text-primary animate-spin mb-4" size={48} />
          <p className="text-white font-bold tracking-widest uppercase">
            {status === 'loading' ? 'Connecting to Peers...' : 'Fetching Metadata...'}
          </p>
          <p className="mt-2 text-xs text-gray-500">{progress}% downloaded</p>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full" controls />
    </div>
  );
}
