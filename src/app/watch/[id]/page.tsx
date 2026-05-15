import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import { fetchEpisodes, fetchStreamLinks } from '@/lib/consumet';
import Player from '@/components/Player';
import Link from 'next/link';
import { Calendar, Info, Tv } from 'lucide-react';

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
  
  // 2. Get Episodes from Consumet
  const consumetInfo = await fetchEpisodes(anime.title.english || anime.title.romaji);
  const episodes = consumetInfo?.episodes || [];
  
  // 3. Find current episode
  const currentEpNum = ep ? parseInt(ep) : 1;
  const currentEpisode = episodes.find((e: any) => e.number === currentEpNum) || episodes[0];

  // 4. Fetch stream link DIRECTLY (Fixes the Server Error)
  let streamUrl = '';
  if (currentEpisode) {
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
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Content (Player & Info) */}
          <div className="flex-1 min-w-0">
            <Player url={streamUrl} />
            
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

              <p className="text-gray-400 text-sm md:text-base leading-relaxed line-clamp-4" 
                 dangerouslySetInnerHTML={{ __html: anime.description }} />
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
