import { ANIME } from '@consumet/extensions';

const hianime = new ANIME.Hianime();
const animepahe = new ANIME.AnimePahe();

export async function fetchEpisodes(animeTitle: string) {
  try {
    // Try Hianime first
    let results = await hianime.search(animeTitle);
    if (results.results.length > 0) {
      const anime = results.results[0];
      return await hianime.fetchAnimeInfo(anime.id);
    }

    // Fallback to AnimePahe
    results = await animepahe.search(animeTitle);
    if (results.results.length > 0) {
      const anime = results.results[0];
      return await animepahe.fetchAnimeInfo(anime.id);
    }

    return null;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string) {
  try {
    // Try Hianime first
    try {
      const links = await hianime.fetchEpisodeSources(episodeId);
      if (links && links.sources && links.sources.length > 0) return links;
    } catch (e) {
      // ignore and try next
    }

    try {
      const links = await animepahe.fetchEpisodeSources(episodeId);
      return links;
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error('Error fetching stream links:', error);
    return null;
  }
}
