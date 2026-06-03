'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SafeTorrentPlayer from '@/components/SafeTorrentPlayer';
import Player from '@/components/Player';
import {
  Calendar, Tv, Star, Download, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight, Magnet, ExternalLink,
  Zap, Monitor
} from 'lucide-react';

interface SeaDexResult {
  magnet: string;
  releaseGroup: string;
  isBest: boolean;
  notes: string;
  theoreticalBest: string;
  tracker: string;
  url: string;
  groupedUrl: string;
  error?: string;
}

interface WatchClientProps {
  animeId: number;
  anime: any;
  totalEpisodes: number;
  currentEpNum: number;
}

export default function WatchClient({ animeId, anime, totalEpisodes, currentEpNum }: WatchClientProps) {
  const [result, setResult] = useState<SeaDexResult | null>(null);
  const [searching, setSearching] = useState(true);
  const [searchFailed, setSearchFailed] = useState(false);
  const [mode, setMode] = useState<'torrent' | 'streaming'>('torrent');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [fetchingStream, setFetchingStream] = useState(false);

  useEffect(() => {
    const handleSwitch = () => setMode('streaming');
    window.addEventListener('switch-to-streaming', handleSwitch);
    return () => window.removeEventListener('switch-to-streaming', handleSwitch);
  }, []);

  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const prevEp = currentEpNum > 1 ? currentEpNum - 1 : null;
  const nextEp = currentEpNum < totalEpisodes ? currentEpNum + 1 : null;

  // Fetch Torrent
  useEffect(() => {
    setSearching(true);
    setSearchFailed(false);
    setResult(null);

    const title = anime.title.english || anime.title.romaji;
    const romajiTitle = anime.title.romaji;

    fetch(`/api/torrent?anilistId=${animeId}&title=${encodeURIComponent(title)}&romaji=${encodeURIComponent(romajiTitle)}&ep=${currentEpNum}`)
      .then(r => r.json())
      .then(data => {
        setResult(data);
        if (!data.magnet) {
          setMode('streaming'); // Auto fallback
        }
      })
      .catch(() => {
        setSearchFailed(true);
        setMode('streaming'); // Auto fallback
      })
      .finally(() => setSearching(false));
  }, [animeId, currentEpNum, anime.title.english, anime.title.romaji]);

  // Fetch Streaming Links (if mode is streaming or torrent failed)
  useEffect(() => {
    if (mode === 'streaming') {
      setFetchingStream(true);
      const title = anime.title.english || anime.title.romaji;
      
      // 1. Get episodes from Consumet (via our lib/consumet fetchEpisodes logic)
      // Since fetchEpisodes is server-side/lib, we need to handle the flow.
      // Easiest way: Enhance the watch API or search here.
      // For now, let's assume we need an API endpoint to fetch the stream for a title + ep
      // Looking at src/app/api/watch/[episodeId]/route.ts, it expects a Consumet episodeId.
      
      // We need a way to map Title + Ep -> Consumet Episode ID on the client.
      // Let's create a new search helper or use an existing one.
      
      const fetchStreaming = async () => {
        try {
          const res = await fetch(`/api/watch?title=${encodeURIComponent(title)}&ep=${currentEpNum}`);
          const data = await res.json();
          if (data.sources && data.sources.length > 0) {
            // Prefer 'auto' or '1080p' or just the first one
            const source = data.sources.find((s: any) => s.quality === 'auto' || s.quality === '1080p') || data.sources[0];
            setStreamUrl(source.url);
          }
        } catch (error) {
          console.error('Streaming fetch error:', error);
        } finally {
          setFetchingStream(false);
        }
      };

      fetchStreaming();
    }
  }, [mode, currentEpNum, anime.title.english, anime.title.romaji]);

  const magnet = result?.magnet || '';

  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-16">
      <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row">

        {/* LEFT: Player */}
        <div className="flex-1 min-w-0">
          <div className="w-full bg-black relative">
            {/* Mode Toggle Overlay */}
            <div className="absolute top-4 right-4 z-50 flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setMode('torrent')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  mode === 'torrent' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap size={14} fill={mode === 'torrent' ? 'black' : 'none'} /> HIGH QUALITY
              </button>
              <button
                onClick={() => setMode('streaming')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  mode === 'streaming' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor size={14} /> STANDARD
              </button>
            </div>

            {mode === 'torrent' ? (
              searching ? (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-[#0d0d0d]">
                  <Loader2 className="text-primary animate-spin" size={44} />
                  <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">
                    Searching Torrents...
                  </p>
                </div>
              ) : (
                <SafeTorrentPlayer magnet={magnet} />
              )
            ) : (
              <div className="aspect-video">
                {fetchingStream ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0d0d0d]">
                    <Loader2 className="text-primary animate-spin" size={44} />
                    <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">
                      Loading Stream...
                    </p>
                  </div>
                ) : (
                  <Player url={streamUrl} />
                )}
              </div>
            )}
          </div>

          {/* Info below player */}
          <div className="p-4 md:p-6 border-b border-white/5">
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

            {/* Meta */}
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
              {anime.duration && (
                <span className="bg-white/5 px-2.5 py-1 rounded-md">{anime.duration}m</span>
              )}
            </div>

            {/* SeaDex result status */}
            {!searching && (
              <>
                {searchFailed || result?.error ? (
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-lg border mb-4 bg-red-500/10 text-red-400 border-red-500/20">
                    <AlertTriangle size={12} /> No SeaDex entry found for this anime
                  </div>
                ) : magnet ? (
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg">
                          <Download size={11} /> {result?.isBest ? 'BEST PRINT' : 'SEADEX'}
                        </span>
                        <span className="text-white text-sm font-bold">{result?.releaseGroup}</span>
                      </div>
                      {result?.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <ExternalLink size={11} /> {result.tracker}
                        </a>
                      )}
                    </div>
                    {result?.notes && (
                      <p className="text-gray-500 text-xs italic mt-2 border-t border-white/5 pt-2">
                        "{result.notes}"
                      </p>
                    )}
                    {result?.theoreticalBest && (
                      <p className="text-gray-600 text-xs mt-1">
                        Theoretical best: {result.theoreticalBest}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-lg border mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    <AlertTriangle size={12} />
                    {result?.releaseGroup
                      ? `Best print is "${result.releaseGroup}" but it's on a private tracker`
                      : 'No public torrent available for this episode'}
                  </div>
                )}
              </>
            )}

            {/* Prev / Next */}
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
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-4 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  EP {nextEp} <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Synopsis */}
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

        {/* RIGHT: Episode sidebar */}
        <div className="w-full xl:w-[320px] shrink-0 border-l border-white/5 flex flex-col xl:h-[calc(100vh-64px)] xl:sticky xl:top-16">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#111]">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Episodes</h2>
            <span className="text-xs text-gray-600 font-bold">{totalEpisodes} Total</span>
          </div>

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
                <p className="text-gray-600 text-xs mt-1">{anime.studios?.nodes?.[0]?.name || ''}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
