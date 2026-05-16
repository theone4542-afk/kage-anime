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
    if (!magnet) return;

    let client: any;

    const initWebTorrent = async () => {
      try {
        // Dynamically import WebTorrent only on the client side
        const WebTorrent = (await import('webtorrent')).default;
        client = new WebTorrent();

        client.add(magnet, (torrent: any) => {
          setStatus('metadata');
          
          // Find the video file
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
                console.error('Render error:', err);
                setError('This file format might not be supported by your browser (e.g. MKV with HEVC).');
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
          console.error('Client error:', err);
          setError(err.message);
          setStatus('error');
        });
      } catch (err: any) {
        console.error('WebTorrent init error:', err);
        setError('Failed to initialize torrent engine.');
        setStatus('error');
      }
    };

    initWebTorrent();

    return () => {
      if (client) client.destroy();
    };
  }, [magnet]);

  if (status === 'error') {
    return (
      <div className="aspect-video bg-secondary/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/5">
        <Info className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">PLAYBACK ERROR</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <p className="mt-4 text-xs text-gray-500">Try opening the magnet link in a local player like VLC or MPV.</p>
        <a 
          href={magnet}
          className="mt-6 bg-primary text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all"
        >
          OPEN MAGNET LINK
        </a>
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
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">{progress}% downloaded</p>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full" controls />
    </div>
  );
}
