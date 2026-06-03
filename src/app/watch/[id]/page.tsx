import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import WatchClient from './WatchClient';

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

  const anilistData: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: animeId });
  const anime = anilistData.Media;

  const totalEpisodes: number =
    anime.episodes ||
    (anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : 0) ||
    1;

  const currentEpNum = Math.min(ep ? parseInt(ep) : 1, totalEpisodes);

  return (
    <WatchClient
      animeId={animeId}
      anime={anime}
      totalEpisodes={totalEpisodes}
      currentEpNum={currentEpNum}
    />
  );
}