'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SafeTorrentPlayer from '@/components/SafeTorrentPlayer';
import Link from 'next/link';
import { Calendar, Tv, Star, Download, AlertTriangle, Loader2 } from 'lucide-react';

interface SeaDexInfo {
  bestRelease: string;
  altRelease: string;
  notes: string;
}

interface WatchClientProps {
  animeId: number;
  anime: any;
  totalEpisodes: number;
  currentEpNum: number;
}

export default function WatchClient({
  animeId,
  anime,
  totalEpisodes,
  currentEpNum,
}: WatchClientProps) {
  const [magnet, setMagnet] = useState<string>('');
  const [seadex, setSeadex] = useState<SeaDexInfo | null>(null);
  const [searching, setSearching] = useState(true);
  const [searchFailed, setSearchFailed] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const romajiTitle = anime.title.romaji || '';
  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  useEffect(() => {
    setSearching(true);
    setSearchFailed(false);
    setMagnet('');
    setSeadex(null);

    const params = new URLSearchParams({
      title,
      romaji: romajiTitle,
      ep: String(currentEpNum),
    });

    fetch(`/api/torrent?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setSearchFailed(true);
        } else {
          setMagnet(data.magnet || '');
          setSeadex(data.seadex || null);
        }
      })
      .catch(() => setSearchFailed(true))
      .finally(() => setSearching(false));
  }, [title, romajiTitle, currentEpNum]);

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 pt-24 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto">

        {/* Status Banner */}
        {searching ? (
          <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
            <Loader2 className="text-primary animate-spin shrink-0" size={20} />
            <p className="text-gray-400 text-sm">
              Searching Nyaa for <span className="text-white font-bold">{title}</span> Episode {currentEpNum}...
            </p>
          </div>
        ) : searchFailed ? (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-400 text-sm">Search failed. Check your connection or try again.</p>
          </div>
        ) : seadex ? (
          <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4 flex-wrap">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-primary font-bold text-xs uppercase tracking-wider">SeaDex Best Print</h3>
              <p className="text-white text-sm font-medium truncate">{seadex.bestRelease}</p>
              {seadex.altRelease && (
                <p className="text-gray-500 text-xs truncate">Alt: {seadex.altRelease}</p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-2 shrink-0 ${
              magnet
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            }`}>
              <Download size={14} />
              {magnet ? 'CR WEB-DL FOUND' : 'NOT FOUND ON NYAA'}
            </div>
          </div>
        ) : !searching && !magnet ? (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
            <p className="text-yellow-400 text-sm">
              No SeaDex entry for <span className="font-bold">{title}</span>. Searched Nyaa directly.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col xl:flex-row gap-8">

          {/* Player & Info */}
          <div className="flex-1 min-w-0">
            {/* Show player only after search completes */}
            {searching ? (
              <div className="aspect-video bg-secondary/20 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-primary animate-spin" size={48} />
                <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">
                  Finding Best Source...
                </p>
              </div>
            ) : (
              <SafeTorrentPlayer magnet={magnet} />
            )}

            <div className="mt-8 bg-secondary/20 p-6 rounded-2xl border border-white/5">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                {anime.title.english || anime.title.romaji}
              </h1>

              <div className="flex flex-wrap gap-3 text-sm mb-6">
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/20 font-bold">
                  EP {currentEpNum}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 text-gray-300 px-3 py-1 rounded-lg">
                  <Tv size={14} /> {anime.status}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 text-gray-300 px-3 py-1 rounded-lg">
                  <Calendar size={14} /> {anime.seasonYear}
                </div>
                {anime.averageScore && (
                  <div className="flex items-center gap-1.5 bg-white/5 text-gray-300 px-3 py-1 rounded-lg">
                    <Star size={14} className="text-primary" fill="currentColor" /> {anime.averageScore}%
                  </div>
                )}
              </div>

              <p
                className="text-gray-400 text-sm leading-relaxed line-clamp-4"
                dangerouslySetInnerHTML={{ __html: anime.description || '' }}
              />

              {seadex?.notes && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Release Notes
                  </h4>
                  <p className="text-sm text-gray-400 italic">"{seadex.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Episode Sidebar */}
          <div className="w-full xl:w-80 shrink-0">
            <div className="bg-secondary/30 rounded-2xl border border-white/5 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Episodes</h2>
                <span className="text-xs text-gray-500">{episodeList.length} Total</span>
              </div>
              <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-5 gap-1.5">
                  {episodeList.map((epNum) => (
                    <Link
                      key={epNum}
                      href={`/watch/${animeId}?ep=${epNum}`}
                      className={`aspect-square flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                        epNum === currentEpNum
                          ? 'bg-primary text-black shadow-lg shadow-primary/20'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {epNum}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
