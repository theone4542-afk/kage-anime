import { ANIME } from '@consumet/extensions';

const gogoanime = new ANIME.Gogoanime();

export async function fetchEpisodes(animeTitle: string) {
  try {
    const results = await gogoanime.search(animeTitle);
    if (results.results.length > 0) {
      // Find the best title match
      const anime = results.results.find((r: any) => 
        r.title.toLowerCase() === animeTitle.toLowerCase()
      ) || results.results[0];
      
      const info = await gogoanime.fetchAnimeInfo(anime.id);
      if (info?.episodes) {
        info.episodes = info.episodes.map((ep: any) => ({ ...ep, provider: 'gogoanime' }));
      }
      return info;
    }
    return null;
  } catch (error) {
    console.error('Error fetching episodes from Gogoanime:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string, provider?: string) {
  try {
    const links = await gogoanime.fetchEpisodeSources(episodeId);
    if (links?.sources?.length > 0) return links;
    return null;
  } catch (error) {
    console.error('Error fetching stream links from Gogoanime:', error);
    return null;
  }
}
