import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import { fetchBestRelease, extractGroupName } from '@/lib/seadex';
import { findEpisodeMagnet } from '@/lib/nyaa';
import SafeTorrentPlayer from '@/components/SafeTorrentPlayer';
import Link from 'next/link';
import { Calendar, Tv, Star, Download, AlertTriangle } from 'lucide-react';

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = parseInt(id);

  // 1. AniList metadata
  const anilistData: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: animeId });
  const anime = anilistData.Media;
  const title = anime.title.english || anime.title.romaji;
  const totalEpisodes: number = anime.episodes || 0;

  // 2. SeaDex best release
  const seadex = await fetchBestRelease(title);
  const bestGroup = seadex?.bestRelease ? extractGroupName(seadex.bestRelease) : '';

  // 3. Current episode number
  const currentEpNum = ep ? parseInt(ep) : 1;

  // 4. Find magnet on Nyaa
  let magnetUrl = '';
  if (bestGroup) {
    magnetUrl = await findEpisodeMagnet(bestGroup, title, currentEpNum);
  }
  // Broader fallback if group-specific search fails
  if (!magnetUrl) {
    magnetUrl = await findEpisodeMagnet('', title, currentEpNum);
  }

  // Build episode list from AniList episode count
  const episodeList = totalEpisodes > 0
    ? Array.from({ length: totalEpisodes }, (_, i) => i + 1)
    : [1];

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 pt-24 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto">

        {/* SeaDex Banner */}
        {seadex ? (
          <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
              <Star size={24} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-primary font-bold text-sm uppercase tracking-wider">Best Print</h3>
              <p className="text-white text-sm font-medium truncate">
                {seadex.bestRelease}
              </p>
              {seadex.altRelease && (
                <p className="text-gray-500 text-xs mt-0.5 truncate">Alt: {seadex.altRelease}</p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-2 shrink-0 ${
              magnetUrl
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            }`}>
              <Download size={14} />
              {magnetUrl ? 'TORRENT FOUND' : 'SEARCHING NYAA...'}
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
            <p className="text-yellow-400 text-sm">
              No SeaDex entry found for <span className="font-bold">{title}</span>. Searching Nyaa directly.
            </p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8">

          {/* Player & Info */}
          <div className="flex-1 min-w-0">
            <SafeTorrentPlayer magnet={magnetUrl} />

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

              <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-4 xl:grid-cols-5 gap-1.5">
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
