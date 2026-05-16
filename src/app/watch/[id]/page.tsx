import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import { fetchEpisodes, fetchStreamLinks } from '@/lib/consumet';
import { fetchBestRelease } from '@/lib/seadex';
import { searchNyaa } from '@/lib/nyaa';
import Player from '@/components/Player';
import SafeTorrentPlayer from '@/components/SafeTorrentPlayer';
import Link from 'next/link';
import { Calendar, Info, Tv, Star, Download } from 'lucide-react';

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
  
  // 1. Get AniList details
  const anilistData: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: animeId });
  const anime = anilistData.Media;
  const title = anime.title.english || anime.title.romaji;
  
  // 2. Get SeaDex (Best Print) Info
  const seadex = await fetchBestRelease(title);
  const bestGroup = seadex?.bestRelease?.split(' ')[0] || '';
  
  // 3. Get Episodes from Consumet
  const consumetInfo = await fetchEpisodes(title);
  const episodes = consumetInfo?.episodes || [];
  
  // 4. Find current episode
  const currentEpNum = ep ? parseInt(ep) : 1;
  const currentEpisode = episodes.find((e: any) => e.number === currentEpNum) || episodes[0];

  // 5. Try to find Best Print on Nyaa
  let magnetUrl = '';
  if (bestGroup && currentEpNum) {
    const paddedEp = currentEpNum.toString().padStart(2, '0');
    const nyaaResults = await searchNyaa(`${bestGroup} ${title} ${paddedEp}`);
    if (nyaaResults.length > 0) {
      magnetUrl = nyaaResults[0].magnet;
    }
  }

  // 6. Fallback Stream Link
  let streamUrl = '';
  if (!magnetUrl && currentEpisode) {
    try {
      const data: any = await fetchStreamLinks(currentEpisode.id);
      streamUrl = data?.sources?.find((s: any) => s.quality === 'default' || s.quality === 'auto')?.url || data?.sources?.[0]?.url;
    } catch (err) {
      console.error("Stream fetch failed:", err);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 pt-24 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto">
        
        {seadex && (
          <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-primary font-bold text-sm uppercase tracking-wider">Best Print Available</h3>
              <p className="text-white text-sm font-medium">Recommended: <span className="text-primary">{seadex.bestRelease}</span></p>
            </div>
            {magnetUrl && (
              <div className="ml-auto bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/20 flex items-center gap-2">
                <Download size={14} /> TORRENT STREAMING ACTIVE
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Content (Player & Info) */}
          <div className="flex-1 min-w-0">
            {magnetUrl ? (
              <SafeTorrentPlayer magnet={magnetUrl} />
            ) : (
              <Player url={streamUrl} />
            )}
            
            <div className="mt-8 bg-secondary/20 p-6 rounded-2xl border border-white/5">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                {anime.title.english || anime.title.romaji}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/20">
                  <span className="font-bold">EP {currentEpNum}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg">
                  <Tv size={14} /> <span>{anime.status}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg">
                  <Calendar size={14} /> <span>{anime.seasonYear}</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: anime.description }} />
              
              {seadex?.notes && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Release Notes</h4>
                  <p className="text-sm text-gray-400 italic">"{seadex.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Episode List Sidebar (Optimized) */}
          <div className="w-full xl:w-96 shrink-0">
            <div className="bg-secondary/30 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full max-h-[85vh]">
              <div className="p-5 border-b border-white/5 bg-white/5">
                <h2 className="text-lg font-bold text-white flex items-center justify-between">
                  Episodes
                  <span className="text-xs font-normal text-gray-500">{episodes.length} Total</span>
                </h2>
              </div>
              
              <div className="p-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                  {episodes.map((ep: any) => (
                    <Link
                      key={ep.id}
                      href={`/watch/${animeId}?ep=${ep.number}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        ep.number === currentEpNum 
                        ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' 
                        : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        ep.number === currentEpNum ? 'bg-black/20' : 'bg-white/5 group-hover:bg-primary/20 group-hover:text-primary'
                      }`}>
                        {ep.number}
                      </div>
                      <span className="text-sm line-clamp-1">{ep.title || `Episode ${ep.number}`}</span>
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
