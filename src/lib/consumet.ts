import { ANIME } from '@consumet/extensions';

// Using AnimePahe as it's listed as available in the library
const provider = new ANIME.AnimePahe();

export async function fetchEpisodes(animeTitle: string) {
  try {
    const results = await provider.search(animeTitle);
    if (results.results.length === 0) return null;

    // Find the best match
    const anime = results.results[0];
    const info = await provider.fetchAnimeInfo(anime.id);
    return info;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return null;
  }
}

export async function fetchStreamLinks(episodeId: string) {
  try {
    const links = await provider.fetchEpisodeSources(episodeId);
    return links;
  } catch (error) {
    console.error('Error fetching stream links:', error);
    return null;
  }
}
