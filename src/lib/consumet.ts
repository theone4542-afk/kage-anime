import { ANIME } from '@consumet/extensions';

const hianime = new ANIME.Hianime();
const gogoanime = new ANIME.Gogoanime();
const animepahe = new ANIME.AnimePahe();

export interface Episode {
  id: string;
  number: number;
  title?: string;
  provider: 'hianime' | 'gogoanime' | 'animepahe';
}

export async function fetchEpisodes(animeTitle: string) {
  try {
    // 1. Try Hianime
    try {
      const results = await hianime.search(animeTitle);
      if (results.results.length > 0) {
        const info = await hianime.fetchAnimeInfo(results.results[0].id);
        return {
          episodes: info.episodes.map((ep: any) => ({ ...ep, provider: 'hianime' })),
        };
      }
    } catch (e) {}

    // 2. Try Gogoanime
    try {
      const results = await gogoanime.search(animeTitle);
      if (results.results.length > 0) {
        const info = await gogoanime.fetchAnimeInfo(results.results[0].id);
        return {
          episodes: info.episodes.map((ep: any) => ({ ...ep, provider: 'gogoanime' })),
        };
      }
    } catch (e) {}

    // 3. Try AnimePahe
    try {
      const results = await animepahe.search(animeTitle);
      if (results.results.length > 0) {
        const info = await animepahe.fetchAnimeInfo(results.results[0].id);
        return {
          episodes: info.episodes.map((ep: any) => ({ ...ep, provider: 'animepahe' })),
        };
      }
    } catch (e) {}

    return null;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string, provider: string) {
  try {
    if (provider === 'hianime') {
      return await hianime.fetchEpisodeSources(episodeId);
    } else if (provider === 'gogoanime') {
      return await gogoanime.fetchEpisodeSources(episodeId);
    } else if (provider === 'animepahe') {
      return await animepahe.fetchEpisodeSources(episodeId);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stream links for ${provider}:`, error);
    // Absolute fallback: try all if provider-specific fails
    try { return await gogoanime.fetchEpisodeSources(episodeId); } catch(e) {}
    try { return await hianime.fetchEpisodeSources(episodeId); } catch(e) {}
    return null;
  }
}
