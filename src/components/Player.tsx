'use client';

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface PlayerProps {
  url: string;
}

export default function Player({ url }: PlayerProps) {
  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
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
