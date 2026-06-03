import { ANIME } from '@consumet/extensions';

const kickassanime = new ANIME.KickAssAnime();

export async function fetchEpisodes(animeTitle: string) {
  try {
    const results = await kickassanime.search(animeTitle);
    if (results.results.length > 0) {
      // Find the best title match
      const anime = results.results.find((r: any) => 
        r.title.toLowerCase() === animeTitle.toLowerCase()
      ) || results.results[0];
      
      const info = await kickassanime.fetchAnimeInfo(anime.id);
      if (info?.episodes) {
        info.episodes = info.episodes.map((ep: any) => ({ ...ep, provider: 'kickassanime' }));
      }
      return info;
    }
    return null;
  } catch (error) {
    console.error('Error fetching episodes from KickAssAnime:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string, provider?: string) {
  try {
    const links = await kickassanime.fetchEpisodeSources(episodeId);
    if (links?.sources?.length > 0) return links;
    return null;
  } catch (error) {
    console.error('Error fetching stream links from KickAssAnime:', error);
    return null;
  }
}
