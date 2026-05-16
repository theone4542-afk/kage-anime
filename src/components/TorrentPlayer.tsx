'use client';

import { useEffect, useRef, useState } from 'react';
import { Info, Loader2, ExternalLink } from 'lucide-react';

interface TorrentPlayerProps {
  magnet: string;
}

export default function TorrentPlayer({ magnet }: TorrentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'metadata' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [peers, setPeers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!magnet || typeof window === 'undefined') return;

    let client: any;
    let statsInterval: ReturnType<typeof setInterval>;

    const initWebTorrent = async () => {
      try {
        // Use the browser-specific build to avoid Node.js built-in errors (net, dgram, etc.)
        const WebTorrent = (await import('webtorrent/dist/webtorrent.min.js' as any)).default;

        client = new WebTorrent();

        client.on('error', (err: any) => {
          setError(err?.message || 'WebTorrent error');
          setStatus('error');
        });

        client.add(magnet, (torrent: any) => {
          setStatus('metadata');

          // Prefer MP4/WebM for native browser playback; MKV will likely fail
          const file =
            torrent.files.find((f: any) => f.name.endsWith('.mp4') || f.name.endsWith('.webm')) ||
            torrent.files.find((f: any) => f.name.endsWith('.mkv')) ||
            torrent.files[0];

          if (!file) {
            setError('No playable video file found in torrent.');
            setStatus('error');
            return;
          }

          if (file.name.endsWith('.mkv')) {
            // MKV can't play natively in browser — give a helpful message
            setError(
              `This release is an MKV file (${file.name}). Browsers can't play MKV natively. ` +
              `Click "Open in Client" below to stream it in VLC or qBittorrent.`
            );
            setStatus('error');
            return;
          }

          if (videoRef.current) {
            file.renderTo(videoRef.current, { autoplay: true }, (err: any) => {
              if (err) {
                setError(`Playback failed: ${err.message}`);
                setStatus('error');
              } else {
                setStatus('ready');
              }
            });
          }

          statsInterval = setInterval(() => {
            setProgress(Math.round(torrent.progress * 100));
            setPeers(torrent.numPeers);
            setSpeed(Math.round(torrent.downloadSpeed / 1024)); // KB/s
          }, 1000);
        });
      } catch (err: any) {
        setError('Torrent engine failed to start: ' + (err?.message || ''));
        setStatus('error');
      }
    };

    initWebTorrent();

    return () => {
      clearInterval(statsInterval);
      if (client) {
        try { client.destroy(); } catch {}
      }
    };
  }, [magnet]);

  if (status === 'error') {
    return (
      <div className="aspect-video bg-secondary/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/5">
        <Info className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">PLAYBACK ERROR</h2>
        <p className="text-gray-400 max-w-md mb-6 text-sm leading-relaxed">{error}</p>
        <a
          href={magnet}
          className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
        >
          <ExternalLink size={18} /> Open in Client
        </a>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {(status === 'loading' || status === 'metadata') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-2">
          <Loader2 className="text-primary animate-spin mb-2" size={48} />
          <p className="text-white font-bold tracking-widest uppercase text-sm">
            {status === 'loading' ? 'Connecting to Peers...' : 'Buffering...'}
          </p>
          {status === 'metadata' && (
            <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
              <span>{progress}% downloaded</span>
              <span>{peers} peers</span>
              <span>{speed} KB/s</span>
            </div>
          )}
        </div>
      )}
      <video ref={videoRef} className="w-full h-full" controls />
    </div>
  );
}
