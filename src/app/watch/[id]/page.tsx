import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import { fetchEpisodes } from '@/lib/consumet';
import Player from '@/components/Player';
import Link from 'next/link';

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
  
  // Get AniList details
  const anilistData: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: animeId });
  const anime = anilistData.Media;
  
  // Get Episodes from Consumet
  const consumetInfo = await fetchEpisodes(anime.title.english || anime.title.romaji);
  const episodes = consumetInfo?.episodes || [];
  
  // Find current episode
  const currentEpNum = ep ? parseInt(ep) : 1;
  const currentEpisode = episodes.find((e: any) => e.number === currentEpNum) || episodes[0];

  // Fetch stream link
  let streamUrl = '';
  if (currentEpisode) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/watch/${currentEpisode.id}`);
    const data = await response.json();
    streamUrl = data.sources?.find((s: any) => s.quality === 'default' || s.quality === 'auto')?.url || data.sources?.[0]?.url;
  }

  return (
    <main className="min-h-screen p-8 md:p-16 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Player url={streamUrl} />
            
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {anime.title.english || anime.title.romaji}
              </h1>
              <div className="flex items-center gap-4 text-gray-400 mb-6">
                <span className="text-primary font-bold">Episode {currentEpNum}</span>
                <span>•</span>
                <span>{anime.status}</span>
                <span>•</span>
                <span className="bg-white/5 px-2 py-1 rounded text-xs">{anime.seasonYear}</span>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-3xl" 
                 dangerouslySetInnerHTML={{ __html: anime.description }} />
            </div>
          </div>

          {/* Episode List Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Episodes
            </h2>
            <div className="bg-secondary/50 rounded-xl p-2 max-h-[70vh] overflow-y-auto border border-white/5">
              {episodes.map((ep: any) => (
                <Link
                  key={ep.id}
                  href={`/watch/${animeId}?ep=${ep.number}`}
                  className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                    ep.number === currentEpNum 
                    ? 'bg-primary text-black font-bold' 
                    : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="text-xs opacity-50 w-6">{ep.number}</span>
                  <span className="line-clamp-1">{ep.title || `Episode ${ep.number}`}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
