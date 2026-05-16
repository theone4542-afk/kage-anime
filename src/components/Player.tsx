'use client';

import dynamic from 'next/dynamic';
import { Info, RefreshCw } from 'lucide-react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface PlayerProps {
  url: string;
}

export default function Player({ url }: PlayerProps) {
  if (!url) {
    return (
      <div className="relative aspect-video w-full bg-secondary/20 rounded-2xl flex flex-col items-center justify-center border border-white/5 text-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
            <Info className="text-primary" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">SERVER OFFLINE</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            We're having trouble connecting to the streaming servers. This happens when the third-party providers are down or the content is restricted.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="group flex items-center gap-3 mx-auto bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/5">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        playing
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous'
            },
            forceHLS: true,
          },
        } as any}
      />
    </div>
  );
}
