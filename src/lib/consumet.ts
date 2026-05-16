import { ANIME } from '@consumet/extensions';

const hianime = new ANIME.Zoro(); // Zoro is the current working Hianime provider in consumet
const animepahe = new ANIME.AnimePahe();

export async function fetchEpisodes(animeTitle: string) {
  try {
    // Try Zoro/Hianime first
    let results = await hianime.search(animeTitle);
    if (results.results.length > 0) {
      const anime = results.results[0];
      const info = await hianime.fetchAnimeInfo(anime.id);
      // Tag episodes with provider so fetchStreamLinks knows which to use
      if (info?.episodes) {
        info.episodes = info.episodes.map((ep: any) => ({ ...ep, provider: 'zoro' }));
      }
      return info;
    }

    // Fallback to AnimePahe
    results = await animepahe.search(animeTitle);
    if (results.results.length > 0) {
      const anime = results.results[0];
      const info = await animepahe.fetchAnimeInfo(anime.id);
      if (info?.episodes) {
        info.episodes = info.episodes.map((ep: any) => ({ ...ep, provider: 'animepahe' }));
      }
      return info;
    }

    return null;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string, provider?: string) {
  try {
    if (provider === 'animepahe') {
      const links = await animepahe.fetchEpisodeSources(episodeId);
      if (links?.sources?.length > 0) return links;
    }

    // Default: try Zoro first
    try {
      const links = await hianime.fetchEpisodeSources(episodeId);
      if (links?.sources?.length > 0) return links;
    } catch {
      // fall through
    }

    // Final fallback: AnimePahe
    try {
      const links = await animepahe.fetchEpisodeSources(episodeId);
      if (links?.sources?.length > 0) return links;
    } catch {
      // fall through
    }

    return null;
  } catch (error) {
    console.error('Error fetching stream links:', error);
    return null;
  }
}
