'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, ExternalLink, Wifi } from 'lucide-react';

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
    // Timeout: if no peers found in 20 seconds, give up gracefully
    const timeoutId = setTimeout(() => {
      if (status !== 'ready') {
        setError('Could not connect to peers. The torrent may have no seeders. Open the magnet in a torrent client instead.');
        setStatus('error');
      }
    }, 20000);

    const initWebTorrent = async () => {
      try {
        const WebTorrent = (await import('webtorrent/dist/webtorrent.min.js' as any)).default;
        client = new WebTorrent();

        client.on('error', (err: any) => {
          clearTimeout(timeoutId);
          setError(err?.message || 'WebTorrent error');
          setStatus('error');
        });

        client.add(magnet, (torrent: any) => {
          setStatus('metadata');

          // Prefer MP4/WebM — browser-playable
          const mp4 = torrent.files.find((f: any) =>
            f.name.endsWith('.mp4') || f.name.endsWith('.webm')
          );
          const mkv = torrent.files.find((f: any) => f.name.endsWith('.mkv'));
          const file = mp4 || mkv || torrent.files[0];

          if (!file) {
            clearTimeout(timeoutId);
            setError('No video file found in torrent.');
            setStatus('error');
            return;
          }

          if (!mp4 && mkv) {
            // MKV can't play natively in browser
            clearTimeout(timeoutId);
            setError(
              `This release is an MKV file which browsers can't play natively. ` +
              `Open the magnet link in VLC, qBittorrent, or Stremio to watch.`
            );
            setStatus('error');
            return;
          }

          if (videoRef.current) {
            file.renderTo(videoRef.current, { autoplay: true }, (err: any) => {
              clearTimeout(timeoutId);
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
            setSpeed(Math.round(torrent.downloadSpeed / 1024));
          }, 1000);
        });
      } catch (err: any) {
        clearTimeout(timeoutId);
        setError('Torrent engine failed to start: ' + (err?.message || ''));
        setStatus('error');
      }
    };

    initWebTorrent();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(statsInterval);
      if (client) try { client.destroy(); } catch {}
    };
  }, [magnet]);

  if (status === 'error') {
    return (
      <div className="aspect-video bg-[#0d0d0d] rounded-xl flex flex-col items-center justify-center p-8 text-center border border-white/5">
        <AlertTriangle className="text-yellow-500 mb-4" size={40} />
        <h2 className="text-lg font-bold text-white mb-2">Can't Play in Browser</h2>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-6">
          {error?.includes('peers') 
            ? "No active seeders found for this torrent. It might be too old or obscure for browser streaming."
            : error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switch-to-streaming'))}
            className="flex items-center justify-center gap-2 bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition-all text-sm"
          >
            <Wifi size={16} /> Switch to Standard Stream
          </button>
          <a
            href={magnet}
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-white/20 transition-all text-sm border border-white/10"
          >
            <ExternalLink size={16} /> Open Magnet Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/5">
      {(status === 'loading' || status === 'metadata') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 gap-3">
          <Loader2 className="text-primary animate-spin" size={44} />
          <p className="text-white font-bold tracking-widest uppercase text-xs">
            {status === 'loading' ? 'Connecting to Peers...' : 'Buffering...'}
          </p>
          {status === 'metadata' && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span>{progress}%</span>
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
