'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SafeTorrentPlayer from '@/components/SafeTorrentPlayer';
import { Calendar, Tv, Star, Download, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Magnet } from 'lucide-react';

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

export default function WatchClient({ animeId, anime, totalEpisodes, currentEpNum }: WatchClientProps) {
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

    const params = new URLSearchParams({ title, romaji: romajiTitle, ep: String(currentEpNum) });
    fetch(`/api/torrent?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setSearchFailed(true); return; }
        setMagnet(data.magnet || '');
        setSeadex(data.seadex || null);
      })
      .catch(() => setSearchFailed(true))
      .finally(() => setSearching(false));
  }, [title, romajiTitle, currentEpNum]);

  const prevEp = currentEpNum > 1 ? currentEpNum - 1 : null;
  const nextEp = currentEpNum < totalEpisodes ? currentEpNum + 1 : null;

  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-16">
      <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-0">

        {/* LEFT: Player Column */}
        <div className="flex-1 min-w-0">

          {/* Player */}
          <div className="w-full bg-black">
            {searching ? (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-[#0d0d0d]">
                <Loader2 className="text-primary animate-spin" size={44} />
                <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Searching Nyaa...</p>
              </div>
            ) : (
              <SafeTorrentPlayer magnet={magnet} />
            )}
          </div>

          {/* Below player */}
          <div className="p-4 md:p-6 border-b border-white/5">

            {/* Title + badges */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-lg md:text-2xl font-black text-white leading-tight">
                  {anime.title.english || anime.title.romaji}
                </h1>
                {anime.title.romaji !== anime.title.english && (
                  <p className="text-gray-600 text-sm mt-0.5">{anime.title.romaji}</p>
                )}
              </div>
              {magnet && (
                <a
                  href={magnet}
                  title="Open magnet link"
                  className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-primary transition-colors border border-white/10 hover:border-primary/40 px-3 py-1.5 rounded-lg"
                >
                  <Magnet size={13} /> Magnet
                </a>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
              <span className="bg-primary/10 text-primary font-black px-2.5 py-1 rounded-md border border-primary/20">
                EP {currentEpNum}
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Tv size={11} /> {anime.status}
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Calendar size={11} /> {anime.season} {anime.seasonYear}
              </span>
              {anime.averageScore && (
                <span className="bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Star size={11} className="text-yellow-400" fill="currentColor" /> {anime.averageScore}%
                </span>
              )}
              <span className="bg-white/5 px-2.5 py-1 rounded-md">{anime.duration}m</span>
            </div>

            {/* Source badge */}
            {!searching && (
              <div className={`inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-lg border mb-4 ${
                magnet
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : searchFailed
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {magnet ? (
                  <><Download size={12} /> CR WEB-DL · SubsPlease / Erai-raws</>
                ) : searchFailed ? (
                  <><AlertTriangle size={12} /> Search failed</>
                ) : (
                  <><AlertTriangle size={12} /> No torrent found for this episode</>
                )}
              </div>
            )}

            {/* SeaDex info */}
            {seadex && (
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">SeaDex Recommendation</p>
                <p className="text-white text-sm font-semibold">{seadex.bestRelease}</p>
                {seadex.altRelease && <p className="text-gray-500 text-xs mt-0.5">Alt: {seadex.altRelease}</p>}
                {seadex.notes && <p className="text-gray-500 text-xs mt-2 italic border-t border-white/5 pt-2">"{seadex.notes}"</p>}
              </div>
            )}

            {/* Ep nav */}
            <div className="flex items-center gap-3">
              {prevEp ? (
                <Link
                  href={`/watch/${animeId}?ep=${prevEp}`}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all border border-white/5"
                >
                  <ChevronLeft size={16} /> EP {prevEp}
                </Link>
              ) : <div />}
              {nextEp && (
                <Link
                  href={`/watch/${animeId}?ep=${nextEp}`}
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  EP {nextEp} <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Synopsis</h3>
            <p
              className="text-gray-400 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description || '' }}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {(anime.genres || []).map((g: string) => (
                <span key={g} className="text-[11px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Episode Sidebar */}
        <div className="w-full xl:w-[340px] shrink-0 border-l border-white/5 flex flex-col xl:h-screen xl:sticky xl:top-16">

          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#111]">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Episodes</h2>
            <span className="text-xs text-gray-600 font-bold">{totalEpisodes} Total</span>
          </div>

          {/* Episode grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {episodeList.map((epNum) => (
                <Link
                  key={epNum}
                  href={`/watch/${animeId}?ep=${epNum}`}
                  className={`aspect-square flex items-center justify-center text-xs font-black rounded-lg transition-all duration-150 ${
                    epNum === currentEpNum
                      ? 'bg-primary text-black shadow-lg shadow-primary/30 scale-105'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {epNum}
                </Link>
              ))}
            </div>
          </div>

          {/* Anime info card at bottom of sidebar */}
          <div className="border-t border-white/5 p-4 bg-[#0f0f0f] hidden xl:block">
            <div className="flex gap-3 items-center">
              {anime.coverImage?.large && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={anime.coverImage.large}
                  alt=""
                  className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-black line-clamp-2 leading-tight">
                  {anime.title.english || anime.title.romaji}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {anime.studios?.nodes?.[0]?.name || ''}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
